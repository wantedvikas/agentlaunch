import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { existsSync } from "node:fs";

import { DEMO, preConsent, signUpAndConfirm } from "./helpers";

// Account-creating flow: desktop only (see auth.spec.ts).
test.skip(({ isMobile }) => isMobile, "runs on desktop only");

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

const PNG = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(64, 1),
]);

async function upload(page: Page, file: { name: string; mimeType: string; buffer: Buffer }) {
  await page.getByLabel("Choose a file").setInputFiles(file);
  await page.getByRole("button", { name: "Upload" }).click();
}

async function signedInClient(email: string, password: string) {
  const client = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return { client, userId: data.user.id };
}

// One account for both tests keeps sign-ups under the per-IP rate limit.
test.describe.configure({ mode: "serial" });
let account: { email: string; password: string };

test("upload, download and delete a file; bad files are rejected", async ({ page }) => {
  account = await signUpAndConfirm(page);
  await preConsent(page);
  await page.goto("/dashboard/files");
  await expect(page.getByText("No files yet")).toBeVisible();

  await upload(page, { name: "hello.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByText("File uploaded", { exact: true })).toBeVisible();
  const row = page.getByRole("row", { name: /hello\.png/ });
  await expect(row).toBeVisible();

  // The signed link serves the exact bytes.
  const href = await row.getByRole("link", { name: "Download hello.png" }).getAttribute("href");
  const res = await page.request.get(href!);
  expect(res.status()).toBe(200);
  expect(Buffer.from(await res.body()).subarray(0, 8)).toEqual(PNG.subarray(0, 8));

  // Disallowed type: stopped in the browser.
  await upload(page, {
    name: "logo.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await expect(page.getByText(/Only PNG, JPEG/)).toBeVisible();

  // Spoofed type: HTML named .png passes the browser check but the server sniffs the bytes.
  await upload(page, {
    name: "fake.png",
    mimeType: "image/png",
    buffer: Buffer.from("<html><script>x</script>"),
  });
  await expect(page.getByText("The file's contents don't match its type.")).toBeVisible();
  await expect(page.getByRole("row", { name: /fake\.png/ })).toHaveCount(0);

  await row.getByRole("button", { name: "Delete hello.png" }).click();
  await expect(page.getByText("File deleted", { exact: true })).toBeVisible();
  await expect(page.getByText("No files yet")).toBeVisible();
});

test("another user can't list, download or delete your files (Storage API)", async () => {
  const owner = await signedInClient(DEMO.email, DEMO.password);
  const intruder = await signedInClient(account.email, account.password);

  const path = `${owner.userId}/${crypto.randomUUID()}-probe.txt`;
  const put = await owner.client.storage
    .from("uploads")
    .upload(path, "private", { contentType: "text/plain" });
  expect(put.error).toBeNull();

  try {
    const list = await intruder.client.storage.from("uploads").list(owner.userId);
    expect(list.data ?? []).toEqual([]);
    const signed = await intruder.client.storage.from("uploads").createSignedUrl(path, 60);
    expect(signed.data).toBeNull();
    const download = await intruder.client.storage.from("uploads").download(path);
    expect(download.data).toBeNull();
    const removed = await intruder.client.storage.from("uploads").remove([path]);
    expect(removed.data ?? []).toEqual([]);
    const intruderPut = await intruder.client.storage
      .from("uploads")
      .upload(`${owner.userId}/evil.txt`, "x", { contentType: "text/plain" });
    expect(intruderPut.error).not.toBeNull();

    // Still there for the owner.
    const ownerList = await owner.client.storage.from("uploads").list(owner.userId);
    expect(ownerList.data?.some((f) => path.endsWith(f.name))).toBe(true);
  } finally {
    await owner.client.storage.from("uploads").remove([path]);
  }
});

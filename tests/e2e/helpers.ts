import { expect, type Page } from "@playwright/test";

const MAILPIT = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

/** Seeded local-only demo account (see supabase/seed.sql). */
/** Saved session for the demo user, written by auth.setup.ts. */
export const DEMO_STATE = "playwright/.auth/demo.json";

export const DEMO = { email: "demo@agentlaunch.local", password: "demo-password-123" };

export const uniqueEmail = (tag: string) =>
  `${tag}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@test.local`;

/** Polls the local Mailpit inbox and returns the first link in the newest email to `to`. */
export async function latestEmailLink(to: string, subjectIncludes?: string): Promise<string> {
  let link = "";
  await expect
    .poll(
      async () => {
        const res = await fetch(
          `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`,
        );
        const { messages = [] } = (await res.json()) as {
          messages?: { ID: string; Subject: string }[];
        };
        const msg = messages.find((m) => !subjectIncludes || m.Subject.includes(subjectIncludes));
        if (!msg) return "";
        const full = (await (await fetch(`${MAILPIT}/api/v1/message/${msg.ID}`)).json()) as {
          Text: string;
        };
        link = full.Text.match(/https?:\/\/\S+/)?.[0]?.replace(/[)\]>]+$/, "") ?? "";
        return link;
      },
      { timeout: 15_000, message: `email to ${to}` },
    )
    .not.toBe("");
  return link;
}

export async function signUpAndConfirm(page: Page, opts: { name?: string } = {}) {
  const email = uniqueEmail("user");
  const password = "test-password-123";
  await page.goto("/signup");
  if (opts.name) await page.getByRole("textbox", { name: "Name" }).fill(opts.name);
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page
    .getByLabel(/^Password/)
    .filter({ visible: true })
    .fill(password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByRole("heading", { name: "Check your email" })).toBeVisible();
  await page.goto(await latestEmailLink(email));
  await expect(page).toHaveURL(/\/dashboard$/);
  return { email, password };
}

export async function signIn(page: Page, email: string, password: string) {
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page
    .getByLabel(/^Password/)
    .filter({ visible: true })
    .fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/permissions/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/validation/action-result";

import { BUCKET } from "./queries";
import { checkFile, contentMatchesType, safeFileName } from "./schema";

const SIGNED_OUT: ActionResult = { ok: false, error: "Your session has ended. Sign in again." };

export async function uploadFile(formData: FormData): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  if (!rateLimit(`upload:${user.id}`, 20, 60_000).ok)
    return { ok: false, error: "Too many uploads. Wait a minute and try again." };

  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Choose a file to upload." };
  const check = checkFile(file);
  if (!check.ok) return check;
  const head = new Uint8Array(await file.slice(0, 512).arrayBuffer());
  if (!contentMatchesType(file.type, head))
    return { ok: false, error: "The file's contents don't match its type." };

  const path = `${user.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    console.error("uploadFile failed", error.name);
    return { ok: false, error: "We couldn't upload that file. Please try again." };
  }
  revalidatePath("/dashboard/files");
  return { ok: true };
}

export async function deleteFile(path: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  // Only the caller's own folder, one level deep, no traversal. Storage policies enforce this too.
  if (
    typeof path !== "string" ||
    !path.startsWith(`${user.id}/`) ||
    path.slice(user.id.length + 1).includes("/") ||
    path.includes("..")
  )
    return { ok: false, error: "File not found." };

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) {
    console.error("deleteFile failed", error.name);
    return { ok: false, error: "We couldn't delete that file. Please try again." };
  }
  if (!data?.length) return { ok: false, error: "File not found." };
  revalidatePath("/dashboard/files");
  return { ok: true };
}

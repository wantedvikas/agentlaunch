"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/permissions/auth";
import { createClient } from "@/lib/supabase/server";
import { fieldErrorsFrom, type ActionResult } from "@/lib/validation/action-result";

import { profileInputSchema, type ProfileInput } from "./schema";

export async function updateProfile(input: ProfileInput): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has ended. Sign in again." };
  const parsed = profileInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Check the highlighted fields.",
      fieldErrors: fieldErrorsFrom(parsed.error.issues),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ display_name: parsed.data.displayName || null })
    .eq("id", user.id);
  if (error) {
    console.error("updateProfile failed", error.code);
    return { ok: false, error: "We couldn't save your profile. Please try again." };
  }
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}

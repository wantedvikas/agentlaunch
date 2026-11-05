"use server";

import { revalidatePath } from "next/cache";

import { getCurrentUser } from "@/lib/permissions/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/validation/action-result";

import { isAdmin } from "./queries";

/** Recomputes today's stats now instead of waiting for the hourly job. Admins only. */
export async function refreshStats(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has ended. Sign in again." };
  // Checked here and again inside refresh_daily_stats() in the database.
  if (!(await isAdmin())) return { ok: false, error: "Only admins can do that." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("refresh_daily_stats");
  if (error) {
    console.error("refreshStats failed", error.code);
    return { ok: false, error: "We couldn't refresh the stats. Please try again." };
  }
  revalidatePath("/dashboard/admin");
  return { ok: true };
}

import "server-only";

import { requireUser } from "@/lib/permissions/auth";
import { createClient } from "@/lib/supabase/server";

export type Profile = { id: string; email: string; displayName: string };

export async function getProfile(nextPath = "/dashboard"): Promise<Profile> {
  const user = await requireUser(nextPath);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw new Error("Could not load profile.");
  return { id: user.id, email: user.email, displayName: data?.display_name ?? "" };
}

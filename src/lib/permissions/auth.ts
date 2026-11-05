import "server-only";

import { redirect } from "next/navigation";

import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export type CurrentUser = { id: string; email: string };

/**
 * Data-access-layer entry point. Verifies the session JWT on the server and returns a narrow
 * user, or null. Call it in every Server Component, Server Action and Route Handler that reads
 * or writes user data; never rely on the proxy or hidden buttons for authorization.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  // Unconfigured = nobody can be signed in; callers redirect to /login, which explains setup.
  if (!getSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (error || !claims?.sub) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
}

/** Like getCurrentUser, but redirects to /login when signed out. */
export async function requireUser(nextPath = "/dashboard"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

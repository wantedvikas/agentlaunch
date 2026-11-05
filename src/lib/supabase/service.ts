import "server-only";

import { createClient } from "@supabase/supabase-js";

import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/**
 * Service-role client: it BYPASSES row-level security. The only allowed caller is the Stripe
 * webhook (a request from Stripe, verified by signature, with no user session). Never use it in
 * code that runs for a signed-in user, and never import it from a client component.
 */
export function createServiceClient() {
  const env = getSupabaseEnv();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!env || !key) return null;
  return createClient<Database>(env.url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

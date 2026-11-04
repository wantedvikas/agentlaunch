import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/** Per-request server client. Create a new one for every request; never share it. */
export async function createClient() {
  const env = getSupabaseEnv();
  if (!env) throw new Error("Supabase is not configured. Copy .env.example to .env.local.");
  // supabase-js reads the clock while loading the session; mark this as request-time work so
  // Next doesn't try to include it in a prerender (Cache Components / runtime prefetch).
  await connection();
  const cookieStore = await cookies();

  return createServerClient<Database>(env.url, env.key, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Called from a Server Component, where cookies are read-only. Safe to ignore:
          // the proxy refreshes the session and writes cookies on every request.
        }
      },
    },
  });
}

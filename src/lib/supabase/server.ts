import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import type { Database } from "./database.types";
import { getSupabaseEnv } from "./env";

/** Per-request server client. Create a new one for every request; never share it. */
export async function createClient() {
  // Request-time work: supabase-js reads the clock, and the config check below must not run
  // during a build-time prerender (a fresh clone builds before .env.local exists).
  await connection();
  const env = getSupabaseEnv();
  if (!env) throw new Error("Supabase is not configured. Copy .env.example to .env.local.");
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

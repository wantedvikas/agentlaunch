/**
 * Supabase connection settings. Both values are public by design (the publishable key only
 * grants what RLS allows). Returns null when unset so the UI can explain what's missing.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return { url, key };
}

export const isGoogleAuthEnabled = process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true";

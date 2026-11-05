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

/** Supabase provider ids we ship buttons for, with their display names. */
export const OAUTH_PROVIDERS = {
  google: "Google",
  github: "GitHub",
  azure: "Microsoft",
  slack_oidc: "Slack",
} as const;
export type OAuthProvider = keyof typeof OAUTH_PROVIDERS;

/** Parses NEXT_PUBLIC_AUTH_PROVIDERS ("google,github"); unknown ids are ignored. */
export function parseOAuthProviders(raw: string | undefined): OAuthProvider[] {
  const ids = (raw ?? "").split(",").map((s) => s.trim());
  return [...new Set(ids)].filter((id): id is OAuthProvider => id in OAUTH_PROVIDERS);
}

export const enabledOAuthProviders = parseOAuthProviders(process.env.NEXT_PUBLIC_AUTH_PROVIDERS);

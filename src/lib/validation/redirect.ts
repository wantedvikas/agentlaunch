/**
 * Validates a post-login `next` path against an allowlist so the app can never be used as an
 * open redirect (e.g. `//evil.com`, `https://evil.com`, `/\evil.com`).
 */
const ALLOWED = /^\/(dashboard|reset-password\/update)(\/[\w\-/]*)?(\?[\w\-=&%.]*)?$/;

export function safeNextPath(next: string | null | undefined, fallback = "/dashboard") {
  if (!next) return fallback;
  return ALLOWED.test(next) ? next : fallback;
}

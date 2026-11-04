/**
 * Fixed-window rate limiter for auth actions.
 * shortcut: in-memory, so limits are per server instance and reset on deploy; use a shared
 * store (e.g. Redis/Upstash) when running more than one instance. Supabase Auth also applies
 * its own server-side rate limits.
 */
const windows = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const entry = windows.get(key);
  if (!entry || entry.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true as const };
  }
  if (entry.count >= limit) return { ok: false as const, retryAfterMs: entry.resetAt - now };
  entry.count += 1;
  return { ok: true as const };
}

/** Test helper. */
export function resetRateLimits() {
  windows.clear();
}

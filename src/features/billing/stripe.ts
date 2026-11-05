import "server-only";

/** True when this server can create Checkout and Portal sessions. Keys never reach the browser. */
export function isBillingConfigured() {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID);
}

/**
 * Minimal Stripe REST call (form-encoded POST), so the module needs no SDK dependency.
 * Throws with Stripe's error type only; messages can contain customer details.
 */
export async function stripePost<T>(path: string, params: Record<string, string>): Promise<T> {
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
    signal: AbortSignal.timeout(15_000),
  });
  const body = (await res.json().catch(() => ({}))) as T & { error?: { type?: string } };
  if (!res.ok) throw new Error(`Stripe ${path}: ${body.error?.type ?? `HTTP ${res.status}`}`);
  return body;
}

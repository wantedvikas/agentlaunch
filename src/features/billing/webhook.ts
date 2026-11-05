import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verifies a `Stripe-Signature` header (t=…,v1=…) against the raw request body, as Stripe
 * documents: HMAC-SHA256 of `${t}.${body}` with the endpoint secret, and a 5-minute window
 * against replays. Accepts any matching v1 (Stripe sends several while a secret is rolled).
 */
export function verifyStripeSignature(
  payload: string,
  header: string | null,
  secret: string,
  nowSec = Math.floor(Date.now() / 1000),
  toleranceSec = 300,
): boolean {
  if (!header || !secret) return false;
  const pairs = header.split(",").map((p) => {
    const i = p.indexOf("=");
    return [p.slice(0, i).trim(), p.slice(i + 1).trim()] as const;
  });
  const t = pairs.find(([k]) => k === "t")?.[1];
  const signatures = pairs.filter(([k]) => k === "v1").map(([, v]) => v);
  if (!t || !/^\d+$/.test(t) || signatures.length === 0) return false;
  if (Math.abs(nowSec - Number(t)) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${t}.${payload}`).digest();
  return signatures.some((s) => {
    const given = Buffer.from(s, "hex");
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

/** Builds a valid Stripe-Signature header. For tests and local tooling only. */
export function signStripePayload(
  payload: string,
  secret: string,
  t = Math.floor(Date.now() / 1000),
) {
  const v1 = createHmac("sha256", secret).update(`${t}.${payload}`).digest("hex");
  return `t=${t},v1=${v1}`;
}

type Obj = Record<string, unknown>;
export type StripeEvent = { id: string; type: string; created: number; data: { object: Obj } };
export type BillingUpdate = { eventId: string; type: string; data: Record<string, unknown> };

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);
const idOf = (v: unknown) => str(v) ?? str((v as Obj | null)?.id);

export function isStripeEvent(v: unknown): v is StripeEvent {
  const e = v as StripeEvent | null;
  return (
    typeof e?.id === "string" &&
    typeof e.type === "string" &&
    typeof e.created === "number" &&
    typeof e.data?.object === "object" &&
    e.data.object !== null
  );
}

/**
 * Turns the Stripe events we care about into the flat shape `billing_apply_event` stores.
 * Returns null for events we ignore (Stripe still gets a 200 so it stops retrying).
 */
export function toBillingUpdate(event: StripeEvent): BillingUpdate | null {
  const o = event.data.object;
  const base = { eventId: event.id, type: event.type };
  switch (event.type) {
    case "checkout.session.completed":
      if (o.mode !== "subscription") return null;
      return {
        ...base,
        data: { user_id: str(o.client_reference_id), customer_id: idOf(o.customer) },
      };
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const item = ((o.items as Obj | undefined)?.data as Obj[] | undefined)?.[0];
      const status = str(o.status);
      const subscriptionId = str(o.id);
      if (!status || !subscriptionId) return null;
      return {
        ...base,
        data: {
          user_id: str((o.metadata as Obj | undefined)?.user_id),
          customer_id: idOf(o.customer),
          subscription_id: subscriptionId,
          status,
          price_id: idOf(item?.price),
          // When access ends (if cancelling) or renews. Newer Stripe API versions schedule a
          // cancellation with `cancel_at` (cancel_at_period_end stays false) and keep the period
          // end on the subscription item.
          current_period_end:
            (typeof o.cancel_at === "number" ? o.cancel_at : null) ??
            o.current_period_end ??
            item?.current_period_end ??
            null,
          cancel_at_period_end: o.cancel_at_period_end === true || typeof o.cancel_at === "number",
          event_created: event.created,
        },
      };
    }
    case "invoice.paid":
      return {
        ...base,
        data: {
          customer_id: idOf(o.customer),
          amount_cents: typeof o.amount_paid === "number" ? o.amount_paid : 0,
          currency: str(o.currency),
        },
      };
    default:
      return null;
  }
}

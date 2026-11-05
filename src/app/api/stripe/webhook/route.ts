import { isStripeEvent, toBillingUpdate, verifyStripeSignature } from "@/features/billing/webhook";
import type { Json } from "@/lib/supabase/database.types";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * Stripe webhook. Verifies the signature over the raw body, then applies the event in one
 * database transaction keyed by event id, so retries and duplicate deliveries are no-ops.
 * Point Stripe at https://<your-domain>/api/stripe/webhook (see docs/BILLING.md).
 */
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const db = createServiceClient();
  if (!secret || !db)
    return Response.json({ error: "Billing webhook isn't configured." }, { status: 503 });

  const payload = await request.text();
  if (!verifyStripeSignature(payload, request.headers.get("stripe-signature"), secret))
    return Response.json({ error: "Invalid signature." }, { status: 400 });

  let event: unknown;
  try {
    event = JSON.parse(payload);
  } catch {
    return Response.json({ error: "Invalid payload." }, { status: 400 });
  }
  if (!isStripeEvent(event)) return Response.json({ error: "Invalid event." }, { status: 400 });

  const update = toBillingUpdate(event);
  if (!update) return Response.json({ received: true, ignored: true });

  const { data: applied, error } = await db.rpc("billing_apply_event", {
    p_event_id: update.eventId,
    p_type: update.type,
    p_data: update.data as Json,
  });
  if (error) {
    // Non-2xx makes Stripe retry later; the event id guard makes the retry safe.
    console.error("stripe webhook failed", update.type, error.code);
    return Response.json({ error: "Could not apply event." }, { status: 500 });
  }
  return Response.json({ received: true, duplicate: applied === false });
}

# Stripe billing

The payments module sells **one subscription plan** through Stripe Checkout, lets customers manage it in the Stripe Customer Portal, and keeps the database in sync through a signature-verified, idempotent webhook. `/dashboard/premium` is the example of a paid-only page and action.

Everything below uses **test mode**. You never need a real card.

## How it fits together

1. **Subscribe:** `startCheckout()` (a Server Action) creates a Checkout Session for `STRIPE_PRICE_ID`. It tags the session and the subscription with the user's id, then the browser goes to Stripe.
2. **Stripe confirms:** Stripe calls `POST /api/stripe/webhook`. The route checks the `Stripe-Signature` header against the raw body (HMAC-SHA256, 5-minute window), then calls `billing_apply_event()` in Postgres. That call is one transaction:
   - It records the event id. A duplicate delivery is a no-op.
   - It links the Stripe customer to the user.
   - It updates the subscription row. An older event never overwrites a newer state.
3. **Access:** paid pages and actions call `hasActiveSubscription(user.id)` on the server. The status must be `active` or `trialing`. Users can read only their own billing rows (RLS), and nobody can write them from the browser.
4. **Manage:** `openBillingPortal()` opens the Customer Portal for the signed-in user's own customer id only.

| Event                                                   | Effect                                            |
| ------------------------------------------------------- | ------------------------------------------------- |
| `checkout.session.completed` (subscription mode)        | Links the Stripe customer to the user             |
| `customer.subscription.created` / `updated` / `deleted` | Upserts status, price, period end, cancel-at-end  |
| `invoice.paid`                                          | Records the amount (admin revenue stat)           |
| anything else                                           | 200 `{ ignored: true }`, so Stripe stops retrying |

**Why the webhook uses the Supabase secret key:** Stripe's request has no user session, so it can't act through RLS as anyone. `src/lib/supabase/service.ts` is the only place that key is used. The signature check runs first, and that client can call only `billing_apply_event()`. Code that runs for a signed-in user never uses it.

## Set up (test mode, about 10 minutes)

1. **Create a product and a price.** In the [Stripe dashboard (test mode)](https://dashboard.stripe.com/test/products), add a product (e.g. "Premium") with a **recurring** price. Copy the price id (`price_...`).
2. **Copy your test secret key** (`sk_test_...`) from [API keys](https://dashboard.stripe.com/test/apikeys).
3. **Turn on the Customer Portal.** In [portal settings](https://dashboard.stripe.com/test/settings/billing/portal), save once. Allow cancelling, and payment-method updates if you want them.
4. **Forward webhooks locally** with the [Stripe CLI](https://docs.stripe.com/stripe-cli):
   ```bash
   stripe login
   stripe listen --forward-to localhost:3000/api/stripe/webhook \
     --events checkout.session.completed,customer.subscription.created,customer.subscription.updated,customer.subscription.deleted,invoice.paid
   ```
   It prints a signing secret (`whsec_...`).
5. **Fill in `.env.local`:**
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PRICE_ID=price_...
   STRIPE_WEBHOOK_SECRET=whsec_...          # from stripe listen
   SUPABASE_SECRET_KEY=sb_secret_...        # `pnpm exec supabase status` → Secret key
   ```
6. **Check and run:** `pnpm run doctor`, then `pnpm dev`.
7. **Try it:** go to `/dashboard/billing` → **Subscribe** → pay with card `4242 4242 4242 4242`, any future date and any CVC. You return to the billing page, the plan shows **active** within a few seconds, and `/dashboard/premium` unlocks. **Manage billing** → cancel → the page locks again once Stripe sends the update. Choose "cancel immediately" in the portal to see it right away.

**Missed events?** If `stripe listen` wasn't running when you paid, the plan stays inactive. Start the listener, find the events with `stripe events list --limit 10`, then resend each one with `stripe events resend evt_...`. Duplicates are safe to send.

**Cancelling in the portal** schedules the cancellation for the end of the period: the plan stays **active** and shows "Ends on …". To see the page lock right away in test mode, run `stripe subscriptions cancel sub_... --confirm`.

Change the plan's display name, price text and feature list in `src/features/billing/config.ts`. The amount actually charged always comes from the Stripe price.

## Going live

1. In production, add a webhook endpoint `https://<your-domain>/api/stripe/webhook` (Developers → Webhooks) for the five events above. Use its signing secret as `STRIPE_WEBHOOK_SECRET`.
2. Set the live `STRIPE_SECRET_KEY`, the live `STRIPE_PRICE_ID` and the hosted project's `SUPABASE_SECRET_KEY` as **server-only** environment variables on your host. Never prefix them with `NEXT_PUBLIC_`.
3. Make sure `NEXT_PUBLIC_SITE_URL` is your real domain: Checkout's success and cancel links use it.
4. Run `supabase db push` so the billing tables exist. Then do one live purchase and refund it.

## Tests

- **`pnpm db:test`** (`supabase/tests/billing.test.sql`):
  - **Event handling:** an event is applied once; a duplicate id is ignored; an older event can't overwrite newer state; a subscription is found through its customer id.
  - **Access:** users see only their own rows; nobody can insert, update or call the webhook function from the browser; anon is denied.
- **`pnpm test`** (`tests/unit/billing.test.ts`):
  - **Signatures:** valid, wrong secret, changed body, replay window, and multiple `v1` values.
  - **Events and export:** mapping each event type, envelope validation, and CSV escaping.
- **`pnpm test:e2e`** (`tests/e2e/billing.spec.ts`):
  - **Webhook signatures:** a wrong or missing signature returns 400.
  - **Access over time:** a signed subscription event unlocks the page; resending it reports `duplicate`; a cancellation locks both the page and the export action (checked on the server while the page is still open).
  - The test server uses a test-only webhook secret and the local stack's secret key. No Stripe account is involved.

**Not covered automatically:** a real Checkout and Portal round trip. It needs your Stripe test keys; follow step 7 above.

## Limits of the basic module

One plan, subscriptions only, a single currency for the revenue stat, no trials UI, no proration or refunds handling, and no re-fetching of Stripe state for out-of-order events (the newest-event-wins guard covers the common case). Pro adds these.

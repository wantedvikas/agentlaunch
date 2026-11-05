import { createClient } from "@supabase/supabase-js";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { existsSync } from "node:fs";

import { signStripePayload } from "../../src/features/billing/webhook";
import { DEMO, DEMO_STATE, preConsent } from "./helpers";

// Changes the demo user's billing state: desktop only, so one run at a time per suite.
test.skip(({ isMobile }) => isMobile, "runs on desktop only");

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
// Must match STRIPE_WEBHOOK_SECRET in playwright.config.ts. Test-only value.
const WEBHOOK_SECRET = "whsec_e2e_local_test_only";

const rand = () => Math.random().toString(36).slice(2, 10);

async function sendEvent(request: APIRequestContext, event: object, secret = WEBHOOK_SECRET) {
  const payload = JSON.stringify(event);
  return request.post("/api/stripe/webhook", {
    data: payload,
    headers: {
      "content-type": "application/json",
      "stripe-signature": signStripePayload(payload, secret),
    },
  });
}

const subscriptionEvent = (
  type: string,
  ids: { userId: string; sub: string; customer: string },
  status: string,
  created: number,
) => ({
  id: `evt_e2e_${rand()}`,
  type,
  created,
  data: {
    object: {
      id: ids.sub,
      customer: ids.customer,
      status,
      cancel_at_period_end: false,
      metadata: { user_id: ids.userId },
      items: { data: [{ price: { id: "price_e2e" }, current_period_end: created + 30 * 86400 }] },
    },
  },
});

test("webhook rejects unsigned and wrongly signed requests", async ({ request }) => {
  const unsigned = await request.post("/api/stripe/webhook", { data: "{}" });
  expect(unsigned.status()).toBe(400);
  const wrong = await sendEvent(
    request,
    { id: "evt_x", type: "x", created: 1, data: { object: {} } },
    "whsec_wrong",
  );
  expect(wrong.status()).toBe(400);
});

test.describe(() => {
  // The seeded demo user (sign-ups are rate limited). Fresh ids per run; the newest
  // subscription wins, so state left by earlier runs doesn't matter.
  test.use({ storageState: DEMO_STATE });

  test("webhook unlocks the paid page; duplicates are ignored; cancelling locks it again", async ({
    page,
    request,
  }) => {
    await preConsent(page);
    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false } },
    );
    const { data, error } = await client.auth.signInWithPassword(DEMO);
    if (error) throw error;
    const ids = { userId: data.user.id, sub: `sub_e2e_${rand()}`, customer: `cus_e2e_${rand()}` };
    const now = Math.floor(Date.now() / 1000);
    // Start from "not subscribed" whatever an earlier run left behind.
    await sendEvent(
      request,
      subscriptionEvent("customer.subscription.created", ids, "canceled", now - 10),
    );

    await page.goto("/dashboard/premium");
    await expect(page.getByRole("heading", { name: "This page needs Premium" })).toBeVisible();
    // No Stripe keys in the test env: the page says so instead of showing a dead button.
    await page.goto("/dashboard/billing");
    await expect(page.getByText("Billing isn't configured")).toBeVisible();
    await expect(page.getByRole("button", { name: "Subscribe" })).toHaveCount(0);

    const created = subscriptionEvent("customer.subscription.created", ids, "active", now);
    const first = await sendEvent(request, created);
    expect(first.status()).toBe(200);
    expect(await first.json()).toMatchObject({ received: true, duplicate: false });
    const again = await sendEvent(request, created);
    expect(await again.json()).toMatchObject({ received: true, duplicate: true });

    // The user can read their own subscription (RLS), and only that.
    const { data: rows } = await client.from("billing_subscriptions").select("id, status, user_id");
    expect(rows).toContainEqual({ id: ids.sub, status: "active", user_id: ids.userId });
    expect(rows?.every((r) => r.user_id === ids.userId)).toBe(true);

    await page.goto("/dashboard/billing");
    await expect(page.getByText("active", { exact: true })).toBeVisible();
    await expect(page.getByText(/^Renews on /)).toBeVisible();

    await page.goto("/dashboard/premium");
    const exportButton = page.getByRole("button", { name: "Export projects (CSV)" });
    await expect(exportButton).toBeVisible();
    const download = page.waitForEvent("download");
    await exportButton.click();
    expect((await download).suggestedFilename()).toBe("projects.csv");

    // Cancel while the page is still open: the action itself re-checks access on the server.
    const deleted = subscriptionEvent("customer.subscription.deleted", ids, "canceled", now + 5);
    expect((await sendEvent(request, deleted)).status()).toBe(200);
    await exportButton.click();
    await expect(
      page.getByText("Exporting needs an active Premium subscription.", { exact: true }),
    ).toBeVisible();
    await page.reload();
    await expect(page.getByRole("heading", { name: "This page needs Premium" })).toBeVisible();
  });
});

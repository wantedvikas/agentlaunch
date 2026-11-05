"use server";

import { siteConfig } from "@/config/site";
import { getCurrentUser } from "@/lib/permissions/auth";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/lib/validation/action-result";

import { toCsv } from "./csv";
import { getStripeCustomerId, hasActiveSubscription } from "./queries";
import { isBillingConfigured, stripePost } from "./stripe";

const SIGNED_OUT: ActionResult<string> = {
  ok: false,
  error: "Your session has ended. Sign in again.",
};
const NOT_CONFIGURED: ActionResult<string> = {
  ok: false,
  error: "Billing isn't configured on this server yet.",
};

/** Creates a Stripe Checkout session for the one plan and returns its URL. */
export async function startCheckout(): Promise<ActionResult<string>> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  if (!isBillingConfigured()) return NOT_CONFIGURED;
  if (!rateLimit(`checkout:${user.id}`, 5, 60_000).ok)
    return { ok: false, error: "Too many attempts. Wait a minute and try again." };
  if (await hasActiveSubscription(user.id))
    return { ok: false, error: "You already have an active subscription." };

  const customer = await getStripeCustomerId(user.id);
  const base = siteConfig.url.replace(/\/$/, "");
  try {
    const session = await stripePost<{ url: string }>("/checkout/sessions", {
      mode: "subscription",
      "line_items[0][price]": process.env.STRIPE_PRICE_ID!,
      "line_items[0][quantity]": "1",
      success_url: `${base}/dashboard/billing?checkout=success`,
      cancel_url: `${base}/dashboard/billing`,
      // Both tie the Stripe objects back to this user in the webhook.
      client_reference_id: user.id,
      "subscription_data[metadata][user_id]": user.id,
      ...(customer ? { customer } : user.email ? { customer_email: user.email } : {}),
    });
    return { ok: true, data: session.url };
  } catch (error) {
    console.error("startCheckout failed", (error as Error).message);
    return { ok: false, error: "We couldn't start checkout. Please try again." };
  }
}

/** Opens the Stripe Customer Portal for the signed-in user's own customer only. */
export async function openBillingPortal(): Promise<ActionResult<string>> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  if (!isBillingConfigured()) return NOT_CONFIGURED;
  const customer = await getStripeCustomerId(user.id);
  if (!customer) return { ok: false, error: "You don't have a billing account yet." };
  try {
    const session = await stripePost<{ url: string }>("/billing_portal/sessions", {
      customer,
      return_url: `${siteConfig.url.replace(/\/$/, "")}/dashboard/billing`,
    });
    return { ok: true, data: session.url };
  } catch (error) {
    console.error("openBillingPortal failed", (error as Error).message);
    return { ok: false, error: "We couldn't open the billing portal. Please try again." };
  }
}

/** Example paid-only action: the paywall is checked here on the server, not just in the UI. */
export async function exportProjectsCsv(): Promise<ActionResult<string>> {
  const user = await getCurrentUser();
  if (!user) return SIGNED_OUT;
  if (!(await hasActiveSubscription(user.id)))
    return { ok: false, error: "Exporting needs an active Premium subscription." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("name, description, status, created_at")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("exportProjectsCsv failed", error.code);
    return { ok: false, error: "We couldn't export your projects. Please try again." };
  }
  return {
    ok: true,
    data: toCsv([
      ["name", "description", "status", "created_at"],
      ...data.map((p) => [p.name, p.description, p.status, p.created_at]),
    ]),
  };
}

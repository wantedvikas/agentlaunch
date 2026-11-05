import "server-only";

import { createClient } from "@/lib/supabase/server";

import { ACTIVE_STATUSES } from "./config";

export type Subscription = {
  id: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
};

/** The user's most recent subscription (RLS limits rows to the owner), or null. */
export async function getSubscription(userId: string): Promise<Subscription | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("billing_subscriptions")
    .select("id, status, current_period_end, cancel_at_period_end")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Could not load billing status.");
  return data;
}

export const isActive = (s: Subscription | null) => !!s && ACTIVE_STATUSES.includes(s.status);

/** Server-side paywall check. Call it in every gated page, action and route. */
export async function hasActiveSubscription(userId: string) {
  return isActive(await getSubscription(userId));
}

export async function getStripeCustomerId(userId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("billing_customers")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw new Error("Could not load billing account.");
  return data?.stripe_customer_id ?? null;
}

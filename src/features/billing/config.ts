/**
 * The one plan sold by the basic billing module. Display values only: the real price lives in
 * Stripe (STRIPE_PRICE_ID). Keep `price` in sync with what you configured there.
 */
export const PLAN = {
  name: "Premium",
  price: "$12",
  interval: "month",
  description: "Everything in Free, plus the premium features.",
  features: ["Export your projects as CSV", "Priority support", "Cancel any time from the portal"],
} as const;

/** Stripe statuses that grant access. Everything else (past_due, canceled, …) does not. */
export const ACTIVE_STATUSES = ["active", "trialing"];

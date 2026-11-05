import { describe, expect, it } from "vitest";

import { toCsv } from "@/features/billing/csv";
import {
  isStripeEvent,
  signStripePayload,
  toBillingUpdate,
  verifyStripeSignature,
  type StripeEvent,
} from "@/features/billing/webhook";

const SECRET = "whsec_unit";
const NOW = 1_800_000_000;
const body = JSON.stringify({ id: "evt_1" });

describe("verifyStripeSignature", () => {
  it("accepts a valid signature", () =>
    expect(verifyStripeSignature(body, signStripePayload(body, SECRET, NOW), SECRET, NOW)).toBe(
      true,
    ));
  it("rejects a wrong secret, a changed body or a missing header", () => {
    const header = signStripePayload(body, SECRET, NOW);
    expect(verifyStripeSignature(body, header, "whsec_other", NOW)).toBe(false);
    expect(verifyStripeSignature(`${body} `, header, SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(body, null, SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(body, "garbage", SECRET, NOW)).toBe(false);
    expect(verifyStripeSignature(body, `t=${NOW},v1=zz`, SECRET, NOW)).toBe(false);
  });
  it("rejects replays outside the 5-minute window", () => {
    const header = signStripePayload(body, SECRET, NOW - 301);
    expect(verifyStripeSignature(body, header, SECRET, NOW)).toBe(false);
  });
  it("accepts any matching v1 (secret rotation)", () => {
    const good = signStripePayload(body, SECRET, NOW).split(",")[1];
    expect(verifyStripeSignature(body, `t=${NOW},v1=${"0".repeat(64)},${good}`, SECRET, NOW)).toBe(
      true,
    );
  });
});

const event = (type: string, object: Record<string, unknown>): StripeEvent => ({
  id: "evt_x",
  type,
  created: NOW,
  data: { object },
});

describe("toBillingUpdate", () => {
  it("maps a subscription, reading the period end from the item on new API versions", () => {
    const update = toBillingUpdate(
      event("customer.subscription.updated", {
        id: "sub_1",
        customer: "cus_1",
        status: "active",
        cancel_at_period_end: true,
        metadata: { user_id: "u1" },
        items: { data: [{ price: { id: "price_1" }, current_period_end: NOW + 100 }] },
      }),
    );
    expect(update).toEqual({
      eventId: "evt_x",
      type: "customer.subscription.updated",
      data: {
        user_id: "u1",
        customer_id: "cus_1",
        subscription_id: "sub_1",
        status: "active",
        price_id: "price_1",
        current_period_end: NOW + 100,
        cancel_at_period_end: true,
        event_created: NOW,
      },
    });
  });
  it("treats a scheduled cancel_at (newer API versions) as ending on that date", () => {
    const data = toBillingUpdate(
      event("customer.subscription.updated", {
        id: "sub_1",
        customer: "cus_1",
        status: "active",
        cancel_at_period_end: false,
        cancel_at: NOW + 50,
        items: { data: [{ current_period_end: NOW + 100 }] },
      }),
    )?.data;
    expect(data).toMatchObject({ cancel_at_period_end: true, current_period_end: NOW + 50 });
  });
  it("links the customer from a subscription checkout only", () => {
    expect(
      toBillingUpdate(
        event("checkout.session.completed", {
          mode: "subscription",
          client_reference_id: "u1",
          customer: "cus_1",
        }),
      )?.data,
    ).toEqual({ user_id: "u1", customer_id: "cus_1" });
    expect(toBillingUpdate(event("checkout.session.completed", { mode: "payment" }))).toBeNull();
  });
  it("records paid invoice amounts and ignores other events", () => {
    expect(
      toBillingUpdate(
        event("invoice.paid", { customer: "cus_1", amount_paid: 1200, currency: "usd" }),
      )?.data,
    ).toEqual({ customer_id: "cus_1", amount_cents: 1200, currency: "usd" });
    expect(toBillingUpdate(event("charge.refunded", {}))).toBeNull();
  });
  it("validates the event envelope", () => {
    expect(isStripeEvent(event("x", {}))).toBe(true);
    expect(isStripeEvent({ id: "evt", type: "x" })).toBe(false);
    expect(isStripeEvent(null)).toBe(false);
  });
});

describe("toCsv", () => {
  it("quotes and neutralises formulas", () =>
    expect(toCsv([["a,b", 'say "hi"', "=SUM(A1)", null, 3]])).toBe(
      `"a,b","say ""hi""",'=SUM(A1),,3`,
    ));
});

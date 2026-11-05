import { beforeEach, describe, expect, it } from "vitest";

// @module:analytics
import { analyticsConfig } from "@/components/analytics/config";
// @end:analytics
import { newPasswordSchema, signInSchema, signUpSchema } from "@/features/auth/schema";
import { rateLimit, resetRateLimits } from "@/lib/rate-limit";
import { parseOAuthProviders } from "@/lib/supabase/env";
import { fieldErrorsFrom } from "@/lib/validation/action-result";
import { safeNextPath } from "@/lib/validation/redirect";

describe("safeNextPath (open-redirect guard)", () => {
  it.each([
    "/dashboard",
    "/dashboard/projects",
    "/dashboard/settings?tab=profile",
    "/reset-password/update",
  ])("allows %s", (p) => expect(safeNextPath(p)).toBe(p));
  it.each([
    "//evil.com",
    "https://evil.com",
    "/\\\\evil.com",
    "/dashboard/../../evil",
    "javascript:alert(1)",
    "/login",
    "/dashboardx",
    "",
    null,
    undefined,
  ])("rejects %s", (p) => expect(safeNextPath(p as string)).toBe("/dashboard"));
});

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());
  it("allows up to the limit within the window, then blocks, then resets", () => {
    const t = 1_000_000;
    expect(rateLimit("k", 2, 1000, t).ok).toBe(true);
    expect(rateLimit("k", 2, 1000, t + 1).ok).toBe(true);
    const blocked = rateLimit("k", 2, 1000, t + 2);
    expect(blocked.ok).toBe(false);
    expect(rateLimit("other", 2, 1000, t + 2).ok).toBe(true);
    expect(rateLimit("k", 2, 1000, t + 1000).ok).toBe(true);
  });
});

describe("auth schemas", () => {
  it("normalizes email", () => {
    expect(signInSchema.parse({ email: "  Me@Example.COM ", password: "x" }).email).toBe(
      "me@example.com",
    );
  });
  it("enforces password length 8..72", () => {
    const base = { displayName: "", email: "a@b.co" };
    expect(signUpSchema.safeParse({ ...base, password: "short" }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...base, password: "x".repeat(73) }).success).toBe(false);
    expect(signUpSchema.safeParse({ ...base, password: "long-enough" }).success).toBe(true);
  });
  it("requires matching confirmation", () => {
    const r = newPasswordSchema.safeParse({ password: "long-enough", confirm: "different" });
    expect(r.success).toBe(false);
    expect(fieldErrorsFrom(r.error!.issues)).toEqual({ confirm: "Passwords don't match." });
  });
});

describe("parseOAuthProviders", () => {
  it("keeps known ids in order, drops unknown, blanks and duplicates", () => {
    expect(parseOAuthProviders(" github, google,evil ,github,, slack_oidc")).toEqual([
      "github",
      "google",
      "slack_oidc",
    ]);
  });
  it("is empty when unset", () => {
    expect(parseOAuthProviders(undefined)).toEqual([]);
  });
});

// @module:analytics
describe("analyticsConfig", () => {
  it("accepts well-formed ids", () => {
    const c = analyticsConfig({
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-ABC123XYZ",
      NEXT_PUBLIC_PLAUSIBLE_DOMAIN: "example.com",
    });
    expect(c).toMatchObject({ gaId: "G-ABC123XYZ", plausibleDomain: "example.com" });
  });
  it.each(["UA-1234-1", "G-abc", "G-ABC123');alert(1)//", ""])("rejects GA id %s", (id) => {
    expect(analyticsConfig({ NEXT_PUBLIC_GA_MEASUREMENT_ID: id }).gaId).toBeNull();
  });
  it("rejects a Plausible domain that isn't a hostname", () => {
    expect(
      analyticsConfig({ NEXT_PUBLIC_PLAUSIBLE_DOMAIN: 'x" onload="alert(1)' }).plausibleDomain,
    ).toBeNull();
  });
});
// @end:analytics

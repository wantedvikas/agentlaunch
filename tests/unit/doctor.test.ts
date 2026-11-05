import { describe, expect, it } from "vitest";

import { checkEnv, checkSupabase, checkToolchain, looksSecret } from "../../scripts/doctor.mts";

const good = {
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_abc",
};
const jwt = (role: string) => `x.${Buffer.from(JSON.stringify({ role })).toString("base64url")}.y`;
const failures = (checks: { status: string; name: string }[]) =>
  checks.filter((c) => c.status === "fail").map((c) => c.name);

/** Fake Supabase: maps "METHOD path" to a status code. */
function fakeFetch(routes: Record<string, number>, settings: Record<string, boolean> = {}) {
  return async (url: string, init?: RequestInit) => {
    const path = new URL(url).pathname;
    const status = routes[`${init?.method ?? "GET"} ${path}`] ?? 500;
    return new Response(JSON.stringify({ external: settings }), { status });
  };
}
const healthy = {
  "GET /auth/v1/health": 200,
  "GET /rest/v1/projects": 401,
  "POST /rest/v1/rpc/claim_welcome_email": 401,
  "GET /auth/v1/settings": 200,
};

describe("looksSecret", () => {
  it.each([
    ["sb_secret_123", true],
    [jwt("service_role"), true],
    [jwt("anon"), false],
    ["sb_publishable_123", false],
    [undefined, false],
  ])("%s → %s", (v, expected) => expect(looksSecret(v)).toBe(expected));
});

describe("checkToolchain", () => {
  it("requires Node 22.18+", () => {
    expect(failures(checkToolchain("v22.17.0", "12.1.0", "12.16.1"))).toEqual(["Node.js"]);
    expect(failures(checkToolchain("v24.0.0", "12.1.0", "12.16.1"))).toEqual([]);
  });
  it("fails without pnpm", () =>
    expect(failures(checkToolchain("v22.23.0", null, null))).toEqual(["pnpm"]));
});

describe("checkEnv", () => {
  it("passes a complete local config", () => expect(failures(checkEnv(good, true))).toEqual([]));
  it("flags a secret key in any public variable, without echoing it", () => {
    const checks = checkEnv(
      {
        ...good,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: jwt("service_role"),
        NEXT_PUBLIC_X: "sb_secret_zzz",
      },
      true,
    );
    expect(failures(checks)).toEqual(["NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_X"]);
    expect(JSON.stringify(checks)).not.toContain("sb_secret_zzz");
  });
  it("validates email transport requirements", () => {
    expect(failures(checkEnv({ ...good, EMAIL_TRANSPORT: "resend" }, true))).toEqual([
      "EMAIL_TRANSPORT",
    ]);
    expect(
      failures(
        checkEnv({ ...good, EMAIL_TRANSPORT: "smtp", SMTP_HOST: "h", EMAIL_FROM: "a@b.co" }, true),
      ),
    ).toEqual([]);
  });
  it("rejects malformed analytics ids", () => {
    expect(failures(checkEnv({ ...good, NEXT_PUBLIC_GA_MEASUREMENT_ID: "UA-1" }, true))).toEqual([
      "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    ]);
  });
});

describe("checkSupabase", () => {
  it("passes when reachable, migrated and locked down", async () => {
    expect(failures(await checkSupabase(good, fakeFetch(healthy)))).toEqual([]);
  });
  it("detects missing tables and a database behind the newest migration", async () => {
    expect(
      failures(await checkSupabase(good, fakeFetch({ ...healthy, "GET /rest/v1/projects": 404 }))),
    ).toEqual(["Migrations"]);
    expect(
      failures(
        await checkSupabase(
          good,
          fakeFetch({ ...healthy, "POST /rest/v1/rpc/claim_welcome_email": 404 }),
        ),
      ),
    ).toEqual(["Migrations"]);
  });
  it("fails loudly if anonymous users can read projects", async () => {
    expect(
      failures(await checkSupabase(good, fakeFetch({ ...healthy, "GET /rest/v1/projects": 200 }))),
    ).toEqual(["Row-level security"]);
  });
  it("checks listed sign-in providers are enabled in Supabase", async () => {
    const env = { ...good, NEXT_PUBLIC_AUTH_PROVIDERS: "github,google" };
    expect(
      failures(await checkSupabase(env, fakeFetch(healthy, { github: true, google: false }))),
    ).toEqual(["Sign-in: google"]);
  });
  it("reports an unreachable server", async () => {
    const down = async () => {
      throw new Error("ECONNREFUSED");
    };
    expect(failures(await checkSupabase(good, down))).toEqual(["Supabase reachable"]);
  });
});

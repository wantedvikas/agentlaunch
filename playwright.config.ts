import { defineConfig, devices } from "@playwright/test";
// @module:payments
import { execFileSync } from "node:child_process";
// @end:payments

const PORT = Number(process.env.PORT ?? 3100);
// @module:payments
/** Test-only webhook secret. tests/e2e/billing.spec.ts signs fake Stripe events with the same value. */
const E2E_WEBHOOK_SECRET = "whsec_e2e_local_test_only";
/** The LOCAL stack's secret key, read at run time so it's never written to a file. */
function localSecretKey() {
  if (process.env.SUPABASE_SECRET_KEY) return process.env.SUPABASE_SECRET_KEY;
  try {
    const out = execFileSync("pnpm", ["exec", "supabase", "status", "-o", "env"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.match(/^SECRET_KEY="?([^"\n]+)"?$/m)?.[1] ?? "";
  } catch {
    return "";
  }
}
// @end:payments

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry" },
  projects: [
    // Signs in the seeded demo user once and saves the session for the signed-in tests.
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
      dependencies: ["setup"],
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } },
      dependencies: ["setup"],
    },
  ],
  // Tests run against a production build so they match what ships. Requires local Supabase
  // (`pnpm db:start`) and NEXT_PUBLIC_SUPABASE_* in .env.local or the environment.
  webServer: {
    // Email links must point back at the test server, and NEXT_PUBLIC_* is inlined at build.
    env: {
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      // Exercise optional integrations against local fakes: SMTP → Mailpit, a GitHub button
      // (Supabase builds the authorize URL locally), and a dummy GA id for the consent banner.
      // @module:email
      EMAIL_TRANSPORT: "smtp",
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: "54325",
      EMAIL_FROM: "App <hello@example.local>",
      // @end:email
      NEXT_PUBLIC_AUTH_PROVIDERS: "github",
      // @module:payments
      // Never call real Stripe from tests, even if .env.local has keys (env beats .env.local).
      STRIPE_SECRET_KEY: "",
      STRIPE_PRICE_ID: "",
      STRIPE_WEBHOOK_SECRET: E2E_WEBHOOK_SECRET,
      SUPABASE_SECRET_KEY: localSecretKey(),
      // @end:payments
      // @module:analytics
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST000000",
      // @end:analytics
    },
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});

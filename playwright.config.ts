import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: { baseURL: `http://localhost:${PORT}`, trace: "on-first-retry" },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    { name: "mobile", use: { ...devices["Pixel 7"], viewport: { width: 375, height: 812 } } },
  ],
  // Tests run against a production build so they match what ships. Requires local Supabase
  // (`pnpm db:start`) and NEXT_PUBLIC_SUPABASE_* in .env.local or the environment.
  webServer: {
    // Email links must point back at the test server, and NEXT_PUBLIC_* is inlined at build.
    env: {
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
      // Exercise optional integrations against local fakes: SMTP → Mailpit, a GitHub button
      // (Supabase builds the authorize URL locally), and a dummy GA id for the consent banner.
      EMAIL_TRANSPORT: "smtp",
      SMTP_HOST: "127.0.0.1",
      SMTP_PORT: "54325",
      EMAIL_FROM: "AgentLaunch <hello@agentlaunch.local>",
      NEXT_PUBLIC_AUTH_PROVIDERS: "github",
      NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST000000",
    },
    command: `pnpm build && pnpm start --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
});

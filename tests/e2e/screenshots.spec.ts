import { test } from "@playwright/test";

import { DEMO_STATE } from "./helpers";

// Run with: SCREENSHOTS=1 pnpm test:e2e screenshots   → writes docs/screenshots/*.png
test.skip(!process.env.SCREENSHOTS, "set SCREENSHOTS=1 to capture docs screenshots");

const pages = {
  home: "/",
  features: "/features",
  login: "/login",
  dashboard: "/dashboard",
  projects: "/dashboard/projects",
};

// Dashboard shots use the seeded local demo user (supabase/seed.sql).
test.use({ storageState: DEMO_STATE });

for (const [name, path] of Object.entries(pages)) {
  for (const theme of ["light", "dark"] as const) {
    test(`${name} ${theme}`, async ({ page }, info) => {
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
      if (path === "/login") await page.context().clearCookies();
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.screenshot({
        path: `docs/screenshots/${name}-${info.project.name}-${theme}.png`,
        fullPage: name !== "dashboard" && name !== "projects",
      });
    });
  }
}

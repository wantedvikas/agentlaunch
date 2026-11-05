import { test } from "@playwright/test";

import { DEMO_STATE, preConsent } from "./helpers";

// Run with: SCREENSHOTS=1 pnpm test:e2e screenshots   → writes docs/screenshots/*.png
test.skip(!process.env.SCREENSHOTS, "set SCREENSHOTS=1 to capture docs screenshots");

const pages = {
  home: "/",
  features: "/features",
  login: "/login",
  dashboard: "/dashboard",
  projects: "/dashboard/projects",
};

// Dashboard shots use the seeded local demo user (supabase/seed.sql). Reduced motion shows every
// animation in its finished state (the hero terminal fully typed, sections revealed).
test.use({ storageState: DEMO_STATE, reducedMotion: "reduce" });

for (const [name, path] of Object.entries(pages)) {
  for (const theme of ["light", "dark"] as const) {
    test(`${name} ${theme}`, async ({ page }, info) => {
      await preConsent(page);
      await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
      if (path === "/login") await page.context().clearCookies();
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const file = `docs/screenshots/${name}-${info.project.name}-${theme}.png`;
      // Home: the hero section only (headline + terminal), not the whole page.
      if (name === "home") await page.locator("#main > section").first().screenshot({ path: file });
      else
        await page.screenshot({
          path: file,
          fullPage: name !== "dashboard" && name !== "projects",
        });
    });
  }
}

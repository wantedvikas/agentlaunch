import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import { DEMO_STATE, preConsent } from "./helpers";

const PUBLIC = ["/", "/features", "/login", "/signup", "/reset-password", "/does-not-exist"];
const APP = ["/dashboard", "/dashboard/projects", "/dashboard/settings"];

/** Fails on serious/critical WCAG 2.1 A/AA violations, listing rule ids and selectors. */
async function audit(page: Page, path: string, theme: "light" | "dark") {
  await page.addInitScript((t) => localStorage.setItem("theme", t), theme);
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const serious = violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
  expect(serious, `${path} (${theme})`).toEqual([]);
}

test.describe("accessibility (axe)", () => {
  // Runs at both 375px and 1440px: some rules (e.g. scrollable regions) depend on layout.

  for (const theme of ["light", "dark"] as const) {
    test(`public pages, ${theme}`, async ({ page }) => {
      await preConsent(page);
      for (const path of PUBLIC) await audit(page, path, theme);
    });

    test.describe(() => {
      test.use({ storageState: DEMO_STATE });
      test(`dashboard pages, ${theme}`, async ({ page }) => {
        await preConsent(page);
        for (const path of APP) await audit(page, path, theme);
      });
    });
  }

  // @module:analytics
  test("cookie banner and open dialog", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("region", { name: "Cookie consent" })).toBeVisible();
    const banner = await new AxeBuilder({ page })
      .include('[aria-label="Cookie consent"]')
      .analyze();
    expect(
      banner.violations.filter((v) => v.impact === "serious" || v.impact === "critical"),
    ).toEqual([]);
  });
  // @end:analytics
});

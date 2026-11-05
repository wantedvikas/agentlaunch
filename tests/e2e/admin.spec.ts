import { expect, test } from "@playwright/test";

import { DEMO, DEMO_STATE, preConsent, signIn } from "./helpers";

// Seeded local-only admin (see supabase/seed.sql).
const ADMIN = { email: "admin@agentlaunch.local", password: "admin-password-123" };

test.skip(({ isMobile }) => isMobile, "runs on desktop only");

test.describe("as a regular user", () => {
  test.use({ storageState: DEMO_STATE });
  test("the admin page is not found and not linked", async ({ page }) => {
    await preConsent(page);
    // notFound() runs inside Suspense after streaming starts, so Next 16 keeps HTTP 200 and
    // adds noindex; what matters is that nothing admin-only renders.
    await page.goto("/dashboard/admin");
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Stats" })).toHaveCount(0);
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Account menu" }).click();
    await expect(page.getByRole("menuitem", { name: "Settings" })).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Admin" })).toHaveCount(0);
  });
});

test("an admin sees stats, searches and filters users, and refreshes stats", async ({ page }) => {
  await preConsent(page);
  await page.goto("/login?next=/dashboard/admin");
  await signIn(page, ADMIN.email, ADMIN.password);
  await expect(page).toHaveURL(/\/dashboard\/admin$/);

  await expect(page.getByRole("heading", { name: "Admin", level: 1 })).toBeVisible();
  const stats = page.getByRole("region", { name: "Stats" });
  await expect(stats.getByText("Users", { exact: true })).toBeVisible();
  await expect(stats.getByText("Revenue (all time)")).toBeVisible();

  await page.getByRole("searchbox", { name: "Search users" }).fill("demo@");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/q=demo%40/);
  await expect(page.getByRole("cell", { name: new RegExp(DEMO.email) })).toBeVisible();
  await expect(page.getByRole("cell", { name: new RegExp(ADMIN.email) })).toHaveCount(0);

  await page.goto("/dashboard/admin?filter=admin");
  await expect(page.getByRole("cell", { name: new RegExp(ADMIN.email) })).toBeVisible();
  await expect(page.getByRole("cell", { name: new RegExp(DEMO.email) })).toHaveCount(0);

  await page.getByRole("button", { name: "Refresh stats" }).click();
  await expect(page.getByText("Stats refreshed", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Account menu" }).click();
  await expect(page.getByRole("menuitem", { name: "Admin" })).toBeVisible();
});

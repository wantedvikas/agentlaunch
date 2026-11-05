import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { preConsent } from "./helpers";

test.beforeEach(({ page }) => preConsent(page));

test("blog index lists the labelled demo posts, newest first", async ({ page }) => {
  await page.goto("/blog");
  const titles = page.getByRole("article").getByRole("heading", { level: 2 });
  await expect(titles).toHaveText([
    "Welcome to your blog",
    "Why every table starts locked",
    "Building with a coding agent",
  ]);
  await expect(page.getByText("Demo post")).toHaveCount(3);
});

test("a post renders with metadata and a demo notice", async ({ page }) => {
  await page.goto("/blog");
  await page.getByRole("link", { name: "Why every table starts locked" }).click();
  await expect(page).toHaveURL(/\/blog\/row-level-security$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Why every table starts locked");
  await expect(page.getByText(/demo content that ships with the starter/)).toBeVisible();
  await expect(page).toHaveTitle(/Why every table starts locked/);
  const description = await page.locator('meta[name="description"]').getAttribute("content");
  expect(description).toContain("row-level security");
});

test("unknown posts show not-found and aren't indexed; real posts are in the sitemap", async ({
  page,
  request,
}) => {
  // Posts that don't exist render after streaming starts, so Next keeps status 200 but marks the
  // page noindex (documented Next 16 behaviour). Static posts are prerendered and unaffected.
  await page.goto("/blog/does-not-exist");
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("/blog/welcome");
});

test("blog pages fit the screen and pass axe", async ({ page }) => {
  for (const path of ["/blog", "/blog/welcome"]) {
    await page.goto(path);
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow, path).toBeLessThanOrEqual(0);
    const { violations } = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
    expect(
      violations.filter((v) => v.impact === "serious" || v.impact === "critical").map((v) => v.id),
      path,
    ).toEqual([]);
  }
});

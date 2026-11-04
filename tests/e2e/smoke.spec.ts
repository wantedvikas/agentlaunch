import { expect, test } from "@playwright/test";

test.describe("marketing", () => {
  test("home renders with working primary CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.getByRole("link", { name: /see what's included/i }).click();
    await expect(page).toHaveURL(/\/features$/);
    await expect(page.getByRole("heading", { level: 2, name: /what you get/i })).toBeVisible();
  });

  test("no horizontal overflow", async ({ page }) => {
    for (const path of [
      "/",
      "/features",
      "/dashboard",
      "/dashboard/projects",
      "/dashboard/settings",
    ]) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow, `overflow on ${path}`).toBeLessThanOrEqual(0);
    }
  });

  test("pages load without console errors or hydration warnings", async ({ page }) => {
    const problems: string[] = [];
    page.on("console", (m) => m.type() === "error" && problems.push(m.text()));
    page.on("pageerror", (e) => problems.push(e.message));
    for (const path of [
      "/",
      "/features",
      "/dashboard",
      "/dashboard/projects",
      "/dashboard/settings",
    ]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
    }
    expect(problems).toEqual([]);
  });

  test("skip link moves focus to main content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
  });

  test("theme toggle switches to dark and persists across reload", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("theme-toggle").click();
    await page.getByRole("menuitemradio", { name: "Dark" }).click();
    await expect(page.locator("html")).toHaveClass(/dark/);
    await page.reload();
    await expect(page.locator("html")).toHaveClass(/dark/);
  });

  test("SEO files are served", async ({ request }) => {
    expect((await request.get("/robots.txt")).ok()).toBe(true);
    const sitemap = await request.get("/sitemap.xml");
    expect(await sitemap.text()).toContain("/features");
    expect((await request.get("/opengraph-image")).headers()["content-type"]).toContain(
      "image/png",
    );
  });

  test("unknown route shows branded 404", async ({ page }) => {
    const res = await page.goto("/does-not-exist");
    expect(res?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });
});

test.describe("mobile navigation", () => {
  test("marketing menu opens and navigates", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Features" }).click();
    await expect(page).toHaveURL(/\/features$/);
  });

  test("dashboard drawer navigates and closes", async ({ page, isMobile }) => {
    test.skip(!isMobile, "mobile only");
    await page.goto("/dashboard");
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Projects" }).click();
    await expect(page).toHaveURL(/\/dashboard\/projects$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test.describe("dashboard", () => {
  test("sidebar marks the current page", async ({ page, isMobile }) => {
    test.skip(!!isMobile, "desktop sidebar");
    await page.goto("/dashboard/settings");
    await expect(page.getByRole("link", { name: "Settings" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  test("new project dialog validates and is keyboard-closable", async ({ page }) => {
    await page.goto("/dashboard/projects");
    await page.getByRole("button", { name: /new project/i }).click();
    const dialog = page.getByRole("dialog", { name: "New project" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Create project" }).click();
    await expect(dialog.getByText("Name must be at least 2 characters.")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByRole("button", { name: /new project/i })).toBeFocused();
  });
});

import { expect, test } from "@playwright/test";

import { DEMO, latestEmailLink, signIn, signUpAndConfirm } from "./helpers";

// Account-creating flows run once (desktop) to stay within auth rate limits.
test.skip(({ isMobile }) => isMobile, "auth flows run on desktop only");

test("signed-out visitors are redirected from the dashboard to login", async ({ page }) => {
  await page.goto("/dashboard/projects");
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard%2Fprojects$/);
});

test("wrong password shows a generic error", async ({ page }) => {
  await page.goto("/login");
  await signIn(page, DEMO.email, "not-the-password");
  await expect(page.getByText("Incorrect email or password.")).toBeVisible();
  await expect(page).toHaveURL(/\/login/);
});

test("login ignores an off-site next parameter", async ({ page }) => {
  await page.goto("/login?next=//evil.example");
  await signIn(page, DEMO.email, DEMO.password);
  await expect(page).toHaveURL(/localhost:\d+\/dashboard$/);
});

test("sign up, confirm email, full project CRUD, sign out", async ({ page }) => {
  await signUpAndConfirm(page, { name: "Casey" });
  await expect(page.getByRole("heading", { name: "Welcome, Casey" })).toBeVisible();

  await page.goto("/dashboard/projects");
  await expect(page.getByText("No projects yet")).toBeVisible();

  // Create
  await page.getByRole("button", { name: "New project" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel(/^Name/).fill("Launch plan");
  await dialog.getByLabel("Description").fill("First milestone");
  await dialog.getByRole("button", { name: "Create project" }).click();
  await expect(page.getByText("Project created", { exact: true })).toBeVisible();
  const row = page.getByRole("row", { name: /Launch plan/ });
  await expect(row).toBeVisible();

  // Update
  await row.getByRole("button", { name: "Edit Launch plan" }).click();
  await dialog.getByLabel(/^Name/).fill("Launch plan v2");
  await dialog.getByRole("combobox").click();
  await page.getByRole("option", { name: "Paused" }).click();
  await dialog.getByRole("button", { name: "Save changes" }).click();
  const updated = page.getByRole("row", { name: /Launch plan v2/ });
  await expect(updated).toContainText("Paused");

  // Survives reload (really persisted)
  await page.reload();
  await expect(page.getByRole("row", { name: /Launch plan v2/ })).toBeVisible();

  // Delete
  await page.getByRole("button", { name: "Delete Launch plan v2" }).click();
  await page.getByRole("button", { name: "Delete project" }).click();
  await expect(page.getByText("No projects yet")).toBeVisible();

  // Profile update
  await page.goto("/dashboard/settings");
  await page.getByLabel("Display name").fill("Casey Q");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByText("Profile saved", { exact: true })).toBeVisible();

  // Sign out
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login\?notice=signed-out$/);
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
});

test("users cannot see each other's projects", async ({ browser }) => {
  const a = await browser.newContext();
  const b = await browser.newContext();
  const pageA = await a.newPage();
  const pageB = await b.newPage();

  await signUpAndConfirm(pageA);
  const secret = `A-only ${Date.now()}`;
  await pageA.goto("/dashboard/projects");
  await pageA.getByRole("button", { name: "New project" }).click();
  await pageA.getByRole("dialog").getByLabel(/^Name/).fill(secret);
  await pageA.getByRole("dialog").getByRole("button", { name: "Create project" }).click();
  await expect(pageA.getByRole("row", { name: new RegExp(secret) })).toBeVisible();

  await signUpAndConfirm(pageB);
  await pageB.goto("/dashboard/projects");
  await expect(pageB.getByText("No projects yet")).toBeVisible();
  await expect(pageB.getByText(secret)).toHaveCount(0);
  // The seeded demo project is private to the demo user too.
  await expect(pageB.getByText("Demo project (seed data)")).toHaveCount(0);

  await a.close();
  await b.close();
});

test("password reset by email", async ({ page }) => {
  const { email } = await signUpAndConfirm(page);
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/login/);

  await page.getByRole("link", { name: "Forgot password?" }).click();
  await expect(page).toHaveURL(/\/reset-password$/);
  await page.getByRole("textbox", { name: "Email" }).fill(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(page.getByText(/reset link is on its way/)).toBeVisible();

  await page.goto(await latestEmailLink(email, "Reset"));
  await expect(page).toHaveURL(/\/reset-password\/update$/);
  await page.getByLabel("New password", { exact: true }).fill("brand-new-password-1");
  await page.getByLabel("Confirm new password").fill("brand-new-password-1");
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page.getByText("Your password has been updated.")).toBeVisible();

  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await signIn(page, email, "brand-new-password-1");
  await expect(page).toHaveURL(/\/dashboard$/);
});

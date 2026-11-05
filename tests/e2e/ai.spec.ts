import { expect, test } from "@playwright/test";

import { DEMO_STATE, preConsent } from "./helpers";

test.use({ storageState: DEMO_STATE });

test("AI page explains when no API key is configured", async ({ page }) => {
  test.skip(
    !!process.env.ANTHROPIC_API_KEY,
    "a real key is set; this checks the unconfigured state",
  );
  await preConsent(page);
  await page.goto("/dashboard/ai");
  await expect(page.getByRole("heading", { name: "AI assistant", level: 1 })).toBeVisible();
  await expect(page.getByText("AI isn't configured")).toBeVisible();
  await expect(page.getByRole("button", { name: "Ask Claude" })).toHaveCount(0);
});

import { expect, test as setup } from "@playwright/test";

import { DEMO, DEMO_STATE, signIn } from "./helpers";

// Signs in the seeded demo user once; read-only dashboard tests reuse this session.
setup("sign in demo user", async ({ page }) => {
  await page.goto("/login");
  await signIn(page, DEMO.email, DEMO.password);
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.context().storageState({ path: DEMO_STATE });
});

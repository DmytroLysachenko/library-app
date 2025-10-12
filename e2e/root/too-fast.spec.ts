import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Root > Too fast page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("shows rate limit warning and guidance", async ({ page }) => {
    await page.goto("/too-fast", { waitUntil: "domcontentloaded" });

    await expect(page.getByRole("heading", { name: "Too many requests, slow down." })).toBeVisible();
    await expect(
      page.getByText("Looks like you've been making a lot of requests recently!", { exact: false })
    ).toBeVisible();
  });
});

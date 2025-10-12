import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Root > Not found page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("renders fallback UI for missing routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist", { waitUntil: "domcontentloaded" });

    await expect(page.getByText("404")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page Not Found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
  });
});

import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Admin > Dashboard page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/admin", { waitUntil: "domcontentloaded" });
  });

  test("shows key management sections", async ({ page }) => {
    await expect(page.getByText("Recent Borrow Requests")).toBeVisible();
    await expect(page.getByText("Recently Added Books")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Account Requests" })).toBeVisible();
  });

  test("navigates to borrow records from shortcut", async ({ page }) => {
    await page.getByRole("link", { name: "View all", exact: false }).first().click();
    await page.waitForURL(/admin\/borrow-records/);
    await expect(page).toHaveURL(/admin\/borrow-records/);
  });
});

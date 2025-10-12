import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Admin > Account requests page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/admin/account-requests", { waitUntil: "domcontentloaded" });
  });

  test("shows pending request list or empty state", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "All pending account requests" })).toBeVisible();

    const empty = page.getByText("No Pending Account Requests");
    if ((await empty.count()) > 0) {
      await expect(page.getByText("There are currently no account requests awaiting approval.")).toBeVisible();
    } else {
      const cards = page.locator(".user-card");
      await expect(cards.first()).toBeVisible();
    }
  });
});

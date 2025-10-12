import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Admin > Borrow requests page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/admin/borrow-requests", { waitUntil: "domcontentloaded" });
  });

  test("lists pending requests or shows empty message", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Borrow book requests" })).toBeVisible();

    const empty = page.getByText("There are no borrow requests at the moment.");
    if ((await empty.count()) > 0) {
      await expect(empty).toBeVisible();
    } else {
      const rows = page.locator("table tbody tr");
      await expect(rows.first()).toBeVisible();
      await expect(rows.first()).toContainText("@");
    }
  });
});

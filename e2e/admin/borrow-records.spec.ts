import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Admin > Borrow records page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/admin/borrow-records", { waitUntil: "domcontentloaded" });
  });

  test("shows records table or empty state", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Borrow book records" })).toBeVisible();

    const empty = page.getByText("No Record");
    if ((await empty.count()) > 0) {
      await expect(empty).toBeVisible();
      await expect(page.getByText("There are currently no any borrow records exists.")).toBeVisible();
    } else {
      const rows = page.locator("table tbody tr");
      await expect(rows.first()).toBeVisible();
      await expect(rows.first()).toContainText("@");
    }
  });
});

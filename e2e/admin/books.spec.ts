import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Admin > Books page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);

    await page.goto("/admin/books", { waitUntil: "domcontentloaded" });
  });

  test("lists existing books", async ({ page }) => {
    await expect(page.getByTestId("admin-books-heading")).toBeVisible();

    const rows = page
      .getByTestId("admin-books-table")
      .getByTestId("admin-books-row");
    await expect(rows.first()).toBeVisible();
    const firstTitle = await rows
      .first()
      .getByTestId("admin-books-title")
      .innerText();
    expect(firstTitle.trim().length).toBeGreaterThan(0);
  });

  test("clicking delete keeps table unchanged for test account", async ({
    page,
  }) => {
    const rows = page
      .getByTestId("admin-books-table")
      .getByTestId("admin-books-row");
    await expect(rows.first()).toBeVisible();
    const initialCount = await rows.count();

    await rows.first().getByTestId("admin-books-delete").click();
    await page.waitForTimeout(500);

    expect(await rows.count()).toBe(initialCount);
  });
});

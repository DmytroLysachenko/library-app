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

  test("sort selector updates query param and can reset", async ({ page }) => {
    const sortTrigger = page.getByTestId("sort-selector-admin-sort");
    await expect(sortTrigger).toBeVisible();

    await sortTrigger.click();
    await page.getByTestId("sort-selector-admin-sort-option-asc").click();
    await page.waitForURL((url) => url.searchParams.get("sort") === "asc");

    const rows = page
      .getByTestId("admin-books-table")
      .getByTestId("admin-books-row");
    await expect(rows.first()).toBeVisible();
    const firstAscTitle = await rows
      .first()
      .getByTestId("admin-books-title")
      .innerText();

    await sortTrigger.click();
    await page.getByTestId("sort-selector-admin-sort-option-desc").click();
    await page.waitForURL((url) => url.searchParams.get("sort") === "desc");

    await expect(rows.first()).toBeVisible();
    const firstDescTitle = await rows
      .first()
      .getByTestId("admin-books-title")
      .innerText();

    expect(firstAscTitle.trim().length).toBeGreaterThan(0);
    expect(firstDescTitle.trim().length).toBeGreaterThan(0);

    await page.getByTestId("sort-selector-admin-sort-reset").click();
    await page.waitForURL((url) => !url.searchParams.has("sort"));
  });

  test("pagination navigation keeps table populated", async ({ page }) => {
    const rows = page
      .getByTestId("admin-books-table")
      .getByTestId("admin-books-row");
    await expect(rows.first()).toBeVisible();

    const pagination = page.getByTestId("pagination-admin");
    if ((await pagination.count()) === 0) {
      // Pagination is not rendered when there is only one page.
      return;
    }

    await expect(pagination).toBeVisible();

    const nextButton = page.getByTestId("pagination-next");
    if (await nextButton.isDisabled()) {
      await expect(nextButton).toBeDisabled();
      return;
    }

    await nextButton.click();
    await page.waitForURL((url) => url.searchParams.get("page") === "2");
    await expect(rows.first()).toBeVisible();
    const secondPageTitle = await rows
      .first()
      .getByTestId("admin-books-title")
      .innerText();
    expect(secondPageTitle.trim().length).toBeGreaterThan(0);

    await page.getByTestId("pagination-prev").click();
    await page.waitForURL(
      (url) =>
        !url.searchParams.has("page") || url.searchParams.get("page") === "1"
    );
    await expect(rows.first()).toBeVisible();
  });
});

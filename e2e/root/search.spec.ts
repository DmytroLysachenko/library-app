import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Root > Search page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/search", { waitUntil: "domcontentloaded" });
  });

  test("renders search interface with initial results", async ({ page }) => {
    await expect(page.getByTestId("search-section")).toBeVisible();
    await expect(page.getByTestId("search-input-field")).toBeVisible();
    await expect(page.getByTestId("sort-selector-search-results")).toBeVisible();

    const cards = page.getByTestId("book-list-items-search-results").getByTestId("book-card");
    await expect(cards.first()).toBeVisible();
  });

  test("applies query and clears results", async ({ page }) => {
    await page.goto("/search?query=css");
    const firstResult = page.getByTestId("book-list-items-search-results").getByTestId("book-card").first();
    await expect(firstResult).toBeVisible();

    await page.goto("/search?query=zzzzzz", { waitUntil: "domcontentloaded" });
    await expect(page.getByTestId("search-not-found")).toBeVisible();

    await page.getByTestId("search-not-found-clear").click();
    await expect(firstResult).toBeVisible({ timeout: 20000 });
  });

  test("supports sorting and pagination", async ({ page }) => {
    const results = page.getByTestId("book-list-items-search-results").getByTestId("book-card");
    await expect(results.first()).toBeVisible();

    const sortTrigger = page.getByTestId("sort-selector-search-results");
    await sortTrigger.click();
    await page.getByTestId("sort-selector-search-results-option-highestRated").click();
    await expect(results.first()).toBeVisible({ timeout: 20000 });

    const prevButton = page.getByTestId("pagination-prev");
    const nextButton = page.getByTestId("pagination-next");
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();

    if (!(await nextButton.isDisabled())) {
      await nextButton.click();
      await expect(results.first()).toBeVisible({ timeout: 20000 });
    }
  });
});

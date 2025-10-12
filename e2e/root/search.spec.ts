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
    const searchInput = page.getByTestId("search-input-field");
    await searchInput.fill("css");
    await page.waitForURL(/query=css/);

    const firstResult = page.getByTestId("book-list-items-search-results").getByTestId("book-card").first();
    await expect(firstResult).toBeVisible();

    await searchInput.fill("zzzzzz");
    await page.waitForURL(/query=zzzzzz/);
    await expect(page.getByTestId("search-not-found")).toBeVisible();

    await page.getByTestId("search-not-found-clear").click();
    await page.waitForURL((url) => !url.searchParams.has("query"));
    await expect(firstResult).toBeVisible();
  });

  test("supports sorting and pagination", async ({ page }) => {
    const results = page.getByTestId("book-list-items-search-results").getByTestId("book-card");
    await expect(results.first()).toBeVisible();

    const sortTrigger = page.getByTestId("sort-selector-search-results");
    await sortTrigger.click();
    await page.getByTestId("sort-selector-search-results-option-highestRated").click();
    await page.waitForURL((url) => url.searchParams.get("sort") === "highestRated");
    await expect(results.first()).toBeVisible();

    const prevButton = page.getByTestId("pagination-prev");
    const nextButton = page.getByTestId("pagination-next");
    await expect(prevButton).toBeDisabled();

    if (await nextButton.isDisabled()) {
      await expect(nextButton).toBeDisabled();
    } else {
      await nextButton.click();
      await page.waitForURL((url) => url.searchParams.get("page") === "2");
      await expect(prevButton).toBeEnabled();
      await expect(results.first()).toBeVisible();

      await prevButton.click();
      await page.waitForURL((url) => !url.searchParams.has("page") || url.searchParams.get("page") === "1");
      await expect(prevButton).toBeDisabled();
    }
  });
});

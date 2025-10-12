import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Root > Book details page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);

    const firstCard = page.getByTestId("book-list-items-latest-books").getByTestId("book-card").first();
    await expect(firstCard).toBeVisible();
    await firstCard.locator("a").first().click();
    await page.waitForURL(/\/books\//);
  });

  test("shows video and summary sections", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Video" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Summary" })).toBeVisible();
    await expect(page.getByTestId("book-overview")).toBeVisible();
  });

  test("displays detailed overview information", async ({ page }) => {
    await expect(page.getByTestId("book-overview-content")).toBeVisible();
    await expect(page.getByTestId("book-overview-title")).toContainText(/\S/);
    await expect(page.getByTestId("book-overview-info")).toContainText("By");
    await expect(page.getByTestId("book-overview-info")).toContainText("Category:");
    await expect(page.getByTestId("book-overview-copies")).toContainText("Total Books:");
    await expect(page.getByTestId("book-overview-copies")).toContainText("Available Books:");
    await expect(page.getByTestId("borrow-book-button")).toBeEnabled();
  });

  test("lists additional latest books", async ({ page }) => {
    const relatedList = page.getByTestId("book-list-items-latest-books").getByTestId("book-card");
    await expect(relatedList.first()).toBeVisible();
    expect(await relatedList.count()).toBeGreaterThan(0);
  });

  test("shows metadata for related latest books", async ({ page }) => {
    const relatedCards = page.getByTestId("book-list-items-latest-books").getByTestId("book-card");
    await expect(relatedCards.first()).toBeVisible();

    const firstCard = relatedCards.first();
    await expect(firstCard.getByTestId("book-card-title")).toContainText(" - By ");
    await expect(firstCard.getByTestId("book-card-genre")).toContainText(/\S/);

    if ((await relatedCards.count()) > 1) {
      const secondCard = relatedCards.nth(1);
      await expect(secondCard.getByTestId("book-card-title")).toContainText(" - By ");
      await secondCard.locator("a").first().click();
      await page.waitForURL(/\/books\//);
      await expect(page.getByTestId("book-overview")).toBeVisible();
    }
  });
});

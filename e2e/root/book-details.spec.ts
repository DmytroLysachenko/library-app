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

  test("lists additional latest books", async ({ page }) => {
    const relatedList = page.getByTestId("book-list-items-latest-books").getByTestId("book-card");
    await expect(relatedList.first()).toBeVisible();
    expect(await relatedList.count()).toBeGreaterThan(0);
  });
});

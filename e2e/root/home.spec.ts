import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Root > Home page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("shows overview and navigation links", async ({ page }) => {
    await expect(page.getByTestId("nav-link-home")).toHaveAttribute("href", "/");
    await expect(page.getByTestId("nav-link-home")).toHaveText("Home");
    await expect(page.getByTestId("nav-link-search")).toHaveAttribute("href", "/search");
    await expect(page.getByTestId("nav-link-admin")).toHaveAttribute("href", "/admin");

    await expect(page.getByTestId("book-overview")).toBeVisible();
    await expect(page.getByTestId("book-overview-title")).toBeVisible();
    await expect(page.getByTestId("borrow-book-button")).toBeVisible();

    const copiesText = await page.getByTestId("book-overview-copies").innerText();
    expect(copiesText).toMatch(/Total Books:/);
    expect(copiesText).toMatch(/Available Books:/);
  });

  test("opens book details from latest list", async ({ page }) => {
    const firstCard = page.getByTestId("book-list-items-latest-books").getByTestId("book-card").first();
    await expect(firstCard).toBeVisible();

    await firstCard.locator("a").first().click();
    await page.waitForURL(/\/books\//);

    await expect(page.getByTestId("book-overview")).toBeVisible();
  });

  test("lists latest books with titles and genres", async ({ page }) => {
    const latestBooks = page.getByTestId("book-list-items-latest-books").getByTestId("book-card");
    await expect(latestBooks.first()).toBeVisible();

    const firstCard = latestBooks.first();
    await expect(firstCard.getByTestId("book-card-title")).toContainText(" - By ");
    await expect(firstCard.getByTestId("book-card-genre")).toContainText(/\S/);

    if ((await latestBooks.count()) > 1) {
      const secondCard = latestBooks.nth(1);
      await expect(secondCard.getByTestId("book-card-title")).toContainText(" - By ");
      await expect(secondCard.getByTestId("book-card-genre")).toContainText(/\S/);
    }
  });

  test("navigates to search page from header", async ({ page }) => {
    await page.getByTestId("nav-link-search").click();
    await page.waitForURL("/search");
    await expect(page.getByTestId("search-section")).toBeVisible();
  });
});

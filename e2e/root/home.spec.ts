import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Root > Home page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("shows overview and navigation links", async ({ page }) => {
    await expect(page.getByTestId("nav-link-home")).toHaveAttribute("href", "/");
    await expect(page.getByTestId("nav-link-search")).toHaveAttribute("href", "/search");
    await expect(page.getByTestId("nav-link-admin")).toHaveAttribute("href", "/admin");

    await expect(page.getByTestId("book-overview")).toBeVisible();
    await expect(page.getByTestId("book-overview-title")).toBeVisible();
    await expect(page.getByTestId("borrow-book-button")).toBeVisible();
  });

  test("opens book details from latest list", async ({ page }) => {
    const firstCard = page.getByTestId("book-list-items-latest-books").getByTestId("book-card").first();
    await expect(firstCard).toBeVisible();

    await firstCard.locator("a").first().click();
    await page.waitForURL(/\/books\//);

    await expect(page.getByTestId("book-overview")).toBeVisible();
  });
});

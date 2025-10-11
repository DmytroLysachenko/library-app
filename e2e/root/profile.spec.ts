import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Root > My profile page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/my-profile", { waitUntil: "domcontentloaded" });
  });

  test("shows user basic information", async ({ page }) => {
    await expect(page.getByText("Upload an Avatar")).toBeVisible();
    await expect(page.getByText("Coding Academy")).toBeVisible();
    await expect(page.getByText("kawos77360@hartaria.com")).toBeVisible();
  });

  test("renders borrowed, pending and returned sections", async ({ page }) => {
    await expect(page.getByTestId("book-list-heading-borrowed-books")).toBeVisible();
    const borrowedCards = page.getByTestId("book-list-items-borrowed-books").getByTestId("book-card");
    if (await borrowedCards.count()) {
      await expect(borrowedCards.first()).toBeVisible();
    } else {
      await expect(page.getByText("No borrowed books for the moment.")).toBeVisible();
    }

    await expect(page.getByTestId("book-list-heading-pending-book-requests")).toBeVisible();
    const pendingCards = page.getByTestId("book-list-items-pending-book-requests").getByTestId("book-card");
    if (await pendingCards.count()) {
      await expect(pendingCards.first()).toBeVisible();
    } else {
      await expect(page.getByText("No pending books for the moment.")).toBeVisible();
    }

    await expect(page.getByTestId("book-list-heading-returned-books")).toBeVisible();
    const returnedCards = page.getByTestId("book-list-items-returned-books").getByTestId("book-card");
    if (await returnedCards.count()) {
      await expect(returnedCards.first()).toBeVisible();
    } else {
      await expect(page.getByText("No returned books for the moment.")).toBeVisible();
    }
  });
});

import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Admin > Create book page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
  });

  test("navigates from books list to creation form", async ({ page }) => {
    await page.goto("/admin/books", { waitUntil: "domcontentloaded" });

    await page.getByTestId("admin-books-create").click();
    await page.waitForURL("/admin/books/new");

    await expect(page.getByRole("link", { name: "Go Back" })).toBeVisible();
    await expect(page.getByPlaceholder("Book title")).toBeVisible();
    await expect(page.getByPlaceholder("Book author")).toBeVisible();
    await expect(page.getByPlaceholder("Book genre")).toBeVisible();
    await expect(page.getByPlaceholder("Book description")).toBeVisible();
    await expect(page.getByPlaceholder("Book summary")).toBeVisible();
    await expect(page.getByText("Upload a book cover")).toBeVisible();
    await expect(page.getByText("Upload a book trailer")).toBeVisible();
  });

  test("shows validation feedback when submitting empty form", async ({ page }) => {
    await page.goto("/admin/books/new", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Create Book" }).click();

    await expect(page).toHaveURL(/\/admin\/books\/new$/);

    const isFormValid = await page.locator("form").evaluate((form) =>
      (form as HTMLFormElement).checkValidity()
    );
    expect(isFormValid).toBe(false);

    const focusedFieldName = await page.evaluate(() =>
      document.activeElement?.getAttribute("name")
    );
    expect(focusedFieldName).toBe("title");
  });
});

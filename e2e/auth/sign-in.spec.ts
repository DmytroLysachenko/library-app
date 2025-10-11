import { expect, test } from "@playwright/test";

const signInHeading = "Welcome back to LibraryView!";

test.describe("Auth > Sign in page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sign-in");
  });

  test("renders the sign-in form with helper content", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: signInHeading })
    ).toBeVisible();
    await expect(
      page.getByText("Access the vast collection of resources", {
        exact: false,
      })
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toHaveAttribute(
      "type",
      "password"
    );
    await expect(
      page.getByRole("link", { name: "Create an account" })
    ).toHaveAttribute("href", "/sign-up");
    await expect(
      page.getByText("Test user with partial admin accesses")
    ).toBeVisible();
    await expect(
      page.getByText("Email: kawos77360@hartaria.com")
    ).toBeVisible();
  });

  test("allows capturing credentials and navigation across auth modes", async ({
    page,
  }) => {
    const fillField = async (label: string, value: string) => {
      const field = page.getByLabel(label);
      await expect(field).toBeVisible();
      await field.click();
      await field.fill("");
      await field.type(value);
      await expect(field).toHaveValue(value);
      return field;
    };

    await fillField("Email", "reader@example.com");
    await fillField("Password", "Password123");
    await expect(page.getByLabel("Email")).toHaveAttribute("required", "");
    await expect(page.getByLabel("Password")).toHaveAttribute("required", "");

    await page.getByRole("link", { name: "Create an account" }).click();
    await page.waitForURL(/\/sign-up$/);
    await expect(
      page.getByRole("heading", {
        name: /create your library account!/i,
      })
    ).toBeVisible();
    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in" })).toHaveAttribute(
      "href",
      "/sign-in"
    );

    await page.getByRole("link", { name: "Sign in" }).click();
    await page.waitForURL(/\/sign-in$/);
    await expect(
      page.getByRole("heading", { name: signInHeading })
    ).toBeVisible();
  });
});

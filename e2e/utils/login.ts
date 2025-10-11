import { Page } from "@playwright/test";

const TEST_EMAIL = "kawos77360@hartaria.com";
const TEST_PASSWORD = "kawos77360@hartaria.com";

export const loginAsTestUser = async (page: Page) => {
  await page.goto("/sign-in");

  await page.getByRole("textbox", { name: "Email" }).fill(TEST_EMAIL);
  await page.getByRole("textbox", { name: "Password" }).fill(TEST_PASSWORD);

  await page.getByTestId("auth-form-submit").click();

  await page.waitForURL("/");
};

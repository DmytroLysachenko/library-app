import { expect, test } from "@playwright/test";

import { loginAsTestUser } from "../utils/login";

test.describe("Admin > Users page", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsTestUser(page);
    await page.goto("/admin/users", { waitUntil: "domcontentloaded" });
  });

  test("renders users table with key columns", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "All Users" })).toBeVisible();
    const header = page.locator("table thead");
    await expect(header.getByText("Status")).toBeVisible();
    await expect(header.getByText("Name")).toBeVisible();
    await expect(header.getByText("Action")).toBeVisible();

    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();
    await expect(rows.first()).toContainText("@");
  });

  test("clicking delete keeps test data intact", async ({ page }) => {
    const rows = page.locator("table tbody tr");
    await expect(rows.first()).toBeVisible();

    const initialCount = await rows.count();

    await page.evaluate(() => {
      const globalWindow = window as unknown as {
        __alerts?: string[];
        __originalAlert?: typeof window.alert;
      };
      globalWindow.__alerts = [];
      globalWindow.__originalAlert = window.alert;
      window.alert = (message?: string) => {
        globalWindow.__alerts?.push(message ?? "");
      };
    });

    await rows.first().locator("button").last().click();

    await expect.poll(async () =>
      page.evaluate(() => {
        const globalWindow = window as unknown as { __alerts?: string[] };
        return globalWindow.__alerts?.[0] ?? null;
      }),
    ).toBe("You cannot delete from a test account.");

    expect(await rows.count()).toBe(initialCount);

    await page.evaluate(() => {
      const globalWindow = window as unknown as {
        __alerts?: string[];
        __originalAlert?: typeof window.alert;
      };
      if (globalWindow.__originalAlert) {
        window.alert = globalWindow.__originalAlert;
      }
      delete globalWindow.__alerts;
      delete globalWindow.__originalAlert;
    });
  });
});

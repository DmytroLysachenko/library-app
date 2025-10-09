import { defineConfig, devices } from "@playwright/test";

const webServerHost = process.env.PLAYWRIGHT_WEB_SERVER_HOST ?? "127.0.0.1";
const webServerPort = Number(process.env.PLAYWRIGHT_WEB_SERVER_PORT ?? 3100);
const resolvedBaseUrl =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://${webServerHost}:${webServerPort}`;
const shouldStartWebServer = process.env.PLAYWRIGHT_SKIP_WEB_SERVER !== "true";

export default defineConfig({
  testDir: "./e2e",
  snapshotDir: "./e2e/__snapshots__",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: resolvedBaseUrl,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 20_000,
  },
  expect: {
    timeout: 7_500,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],
  webServer: shouldStartWebServer
    ? {
        command: `npm run dev -- --hostname ${webServerHost} --port ${webServerPort}`,
        url: resolvedBaseUrl,
        reuseExistingServer: !process.env.CI,
        stdout: "pipe",
        stderr: "pipe",
        timeout: 120_000,
      }
    : undefined,
});

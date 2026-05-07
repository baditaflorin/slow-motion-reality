import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./test/e2e",
  timeout: 30_000,
  use: {
    baseURL: "http://127.0.0.1:4173/slow-motion-reality/",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run pages-preview -- --port 4173",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});

import { expect, test } from "@playwright/test";

test("loads the slow-motion workbench", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Slow-motion Reality" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Start" })).toBeVisible();
  await expect(page.getByLabel("Slow-motion camera stage")).toBeVisible();
});

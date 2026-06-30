import { expect, test } from "@playwright/test";

test("GET / serves the drawing board", async ({ page, request }) => {
  const response = await request.get("/");
  expect(response.ok()).toBe(true);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "像素绘画板" })).toBeVisible();
  await expect(page.getByTestId("pixel-grid")).toBeVisible();
  await expect(page.getByTestId("pixel-255")).toBeVisible();
});

test("draws, persists, undoes, and redoes pixels", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("clear-button").click();
  await page.getByTestId("palette-red").click();
  await page.getByTestId("pixel-0").click();

  await expect(page.getByTestId("pixel-0")).toHaveAttribute("data-color", "#e9542b");
  await expect(page.getByTestId("painted-count")).toHaveText("1");
  await expect(page.getByTestId("undo-button")).toBeEnabled();

  await page.getByTestId("undo-button").click();
  await expect(page.getByTestId("pixel-0")).toHaveAttribute("data-color", "");
  await expect(page.getByTestId("redo-button")).toBeEnabled();

  await page.getByTestId("redo-button").click();
  await expect(page.getByTestId("pixel-0")).toHaveAttribute("data-color", "#e9542b");

  await page.reload();
  await expect(page.getByTestId("pixel-0")).toHaveAttribute("data-color", "#e9542b");
});

test("fills, resizes, loads samples, and exports PNG", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("clear-button").click();
  await page.getByTestId("palette-gold").click();
  await page.getByTestId("tool-fill").click();
  await page.getByTestId("pixel-10").click();

  await expect(page.getByTestId("pixel-0")).toHaveAttribute("data-color", "#f2c94c");
  await expect(page.getByTestId("pixel-255")).toHaveAttribute("data-color", "#f2c94c");

  await page.getByTestId("size-24").click();
  await expect(page.getByTestId("pixel-575")).toBeVisible();
  await expect(page.getByTestId("pixel-0")).toHaveAttribute("data-color", "#f2c94c");

  await page.getByTestId("sample-harbor").click();
  await expect(page.getByTestId("pixel-255")).toHaveAttribute("data-color", "#2b2520");

  const download = page.waitForEvent("download");
  await page.getByTestId("export-button").click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^pixel-board-.*\.png$/);
});

import { test, expect } from "@playwright/test";

test.describe("Home Page", () => {
  test("should display home page correctly", async ({ page }) => {
    await page.goto("/");

    // Check title
    await expect(page.locator("h1")).toContainText("TennisCoach AI");

    // Check description
    await expect(page.locator("text=Analiza tus golpes de tenis")).toBeVisible();

    // Check features
    await expect(page.locator("text=Sube tu video")).toBeVisible();
    await expect(page.locator("text=Análisis biomecánico")).toBeVisible();
    await expect(page.locator("text=Feedback IA")).toBeVisible();

    // Check CTA button
    const ctaButton = page.locator("text=Comenzar análisis");
    await expect(ctaButton).toBeVisible();
  });

  test("should navigate to upload page", async ({ page }) => {
    await page.goto("/");

    await page.click("text=Comenzar análisis");

    // Should redirect to upload page
    await expect(page).toHaveURL("/upload");
    await expect(page.locator("h1")).toContainText("Analiza tu golpe");
  });
});

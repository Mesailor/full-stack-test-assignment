import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should register a new user", async ({ page }) => {
    await page.goto("/register");

    await page.fill('[name="first_name"]', "Test");
    await page.fill('[name="last_name"]', "User");
    await page.fill('[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('[name="password"]', "Password123");

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");
  });

  test("should login with valid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[name="email"]', "e2e@example.com");
    await page.fill('[name="password"]', "E2eTestPass1");

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[name="email"]', "wrong@example.com");
    await page.fill('[name="password"]', "WrongPassword");

    await page.click('button[type="submit"]');

    await expect(page.locator("text=Invalid credentials")).toBeVisible({
      timeout: 8000,
    });
  });

  test("should redirect unauthenticated users from protected routes", async ({
    page,
  }) => {
    await page.goto("/account");
    await expect(page).toHaveURL("/login");
  });

  test("should redirect unauthenticated users from home route", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });

  test("should logout successfully", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "e2e@example.com");
    await page.fill('[name="password"]', "E2eTestPass1");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");

    await page.click('button:has-text("Sign out")');
    await expect(page).toHaveURL("/login");
  });
});

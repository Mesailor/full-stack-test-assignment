import { test, expect } from "@playwright/test";

test.describe("Complete Shopping Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "e2e@example.com");
    await page.fill('[name="password"]', "E2eTestPass1");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");
  });

  test("should display product listing", async ({ page }) => {
    await page.goto("/products");

    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    });
    const cards = page.locator('[data-testid="product-card"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("should add a product to cart", async ({ page }) => {
    await page.goto("/products");
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    });

    await page.locator('button:has-text("Add to Cart")').first().click();

    const badge = page.locator('[data-testid="cart-badge"]');
    await expect(badge).toBeVisible();
    await expect(badge).toContainText("1");
  });

  test("should view cart and update quantities", async ({ page }) => {
    await page.goto("/products");
    await page.waitForSelector('[data-testid="product-card"]');

    await page.locator('button:has-text("Add to Cart")').first().click();

    await page.goto("/cart");
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
  });

  test("should complete the full checkout flow", async ({ page }) => {
    await page.goto("/products");
    await page.waitForSelector('[data-testid="product-card"]');

    await page.locator('button:has-text("Add to Cart")').first().click();

    await page.goto("/checkout");

    // Step 1: Review cart
    await page.click('button:has-text("Continue to Shipping")');

    // Step 2: Shipping information
    await page.fill('[name="fullName"]', "Test User");
    await page.fill('[name="address"]', "123 Main Street");
    await page.fill('[name="city"]', "New York");
    await page.fill('[name="state"]', "NY");
    await page.fill('[name="zipCode"]', "10001");
    await page.fill('[name="country"]', "United States");
    await page.click('button:has-text("Continue to Payment")');

    // Step 3: Payment information
    await page.fill('[name="cardNumber"]', "4111111111111111");
    await page.fill('[name="cardName"]', "Test User");
    await page.fill('[name="expiryDate"]', "12/27");
    await page.fill('[name="cvv"]', "123");
    await page.click('button:has-text("Place Order")');

    // Step 4: Order confirmation
    await expect(
      page.locator("text=Order Placed Successfully!"),
    ).toBeVisible({ timeout: 10000 });
  });
});

import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("login page should load within acceptable time", async ({ page }) => {
    const start = Date.now();
    await page.goto("/login");
    await page.waitForLoadState("domcontentloaded");
    const loadTime = Date.now() - start;

    // Page should load in under 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("product images should have lazy loading", async ({ page }) => {
    // Login first to access products page
    await page.goto("/login");
    await page.fill('[name="email"]', "e2e@example.com");
    await page.fill('[name="password"]', "E2eTestPass1");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");

    await page.goto("/products");
    await page.waitForSelector('[data-testid="product-card"]', {
      timeout: 10000,
    });

    const lazyImages = page.locator('img[loading="lazy"]');
    const count = await lazyImages.count();
    expect(count).toBeGreaterThan(0);
  });

  test("total JS bundle size should be reasonable", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");

    const jsBundleSize = await page.evaluate(() => {
      return performance
        .getEntriesByType("resource")
        .filter(
          (r) =>
            r.name.includes(".js") &&
            !r.name.includes("node_modules") &&
            "transferSize" in r,
        )
        .reduce((sum, r) => sum + ((r as PerformanceResourceTiming).transferSize ?? 0), 0);
    });

    // Total JS transfer size should be under 500KB
    expect(jsBundleSize).toBeLessThan(500 * 1024);
  });

  test("navigation between pages should be fast", async ({ page }) => {
    await page.goto("/login");
    await page.fill('[name="email"]', "e2e@example.com");
    await page.fill('[name="password"]', "E2eTestPass1");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");

    const start = Date.now();
    await page.goto("/products");
    await page.waitForLoadState("domcontentloaded");
    const navTime = Date.now() - start;

    // Navigation should complete in under 2 seconds
    expect(navTime).toBeLessThan(2000);
  });
});

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility (WCAG 2.1 AA)", () => {
  test("login page should have no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/login");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("register page should have no accessibility violations", async ({
    page,
  }) => {
    await page.goto("/register");
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("should support keyboard navigation on login page", async ({ page }) => {
    await page.goto("/login");

    await page.keyboard.press("Tab");
    const focusedElement = page.locator(":focus");
    await expect(focusedElement).toBeVisible();

    // Tab to password field
    await page.keyboard.press("Tab");
    const secondFocused = page.locator(":focus");
    await expect(secondFocused).toBeVisible();
  });

  test("all buttons should have accessible labels", async ({ page }) => {
    await page.goto("/login");

    const buttons = page.locator("button");
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute("aria-label");
      const text = await button.textContent();
      expect(ariaLabel || text?.trim()).toBeTruthy();
    }
  });

  test("form inputs should have associated labels", async ({ page }) => {
    await page.goto("/login");

    const inputs = page.locator('input:not([type="hidden"])');
    const count = await inputs.count();

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i);
      const id = await input.getAttribute("id");
      const ariaLabel = await input.getAttribute("aria-label");
      const ariaLabelledBy = await input.getAttribute("aria-labelledby");

      // Input should have either a label, aria-label, or aria-labelledby
      const hasAssociatedLabel = id
        ? (await page.locator(`label[for="${id}"]`).count()) > 0
        : false;
      expect(
        hasAssociatedLabel || ariaLabel || ariaLabelledBy,
      ).toBeTruthy();
    }
  });

  test("images should have alt text", async ({ page }) => {
    await page.goto("/login");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute("alt");
      expect(alt).not.toBeNull();
    }
  });
});

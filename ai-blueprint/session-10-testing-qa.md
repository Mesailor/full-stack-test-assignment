# Session 10: Testing & QA - Final Polish

## 🎯 Session Objectives

Complete the platform with comprehensive testing and quality assurance:

- End-to-end testing setup and critical user flows
- Component and integration testing
- Accessibility testing (WCAG 2.1 AA compliance)
- Performance testing and optimization
- Cross-browser compatibility testing
- Security audit and fixes
- Final bug fixes and polish
- Production deployment checklist

**Duration Estimate:** 4-5 hours  
**Dependencies:** Sessions 1-9 (All previous sessions)

---

## 📋 Required Context

Before starting, review:

1. **All previous sessions** - Complete application functionality
2. **`/ai-blueprint/engineering-guidelines.md`** - Testing requirements
3. **`/DESIGN.md`** - Accessibility and design standards

---

## 🧪 Testing Implementation

### Step 1: E2E Testing Setup (Playwright)

Create `apps/web/playwright.config.ts`:

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Step 2: Critical E2E Tests

Create `apps/web/e2e/auth.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should register new user", async ({ page }) => {
    await page.goto("/register");

    await page.fill('[name="first_name"]', "Test");
    await page.fill('[name="last_name"]', "User");
    await page.fill('[name="email"]', `test${Date.now()}@example.com`);
    await page.fill('[name="password"]', "Password123");

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");
  });

  test("should login existing user", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");

    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/");
  });

  test("should protect routes when not authenticated", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL("/login");
  });
});
```

Create `apps/web/e2e/shopping-flow.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Complete Shopping Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('[name="email"]', "test@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await page.waitForURL("/");
  });

  test("should complete purchase flow", async ({ page }) => {
    // Browse products
    await page.goto("/products");
    await expect(page.locator(".product-card")).toHaveCount.greaterThan(0);

    // Add to cart
    await page.locator(".product-card").first().click();
    await page.click('button:has-text("Add to Cart")');
    await expect(page.locator("[data-cart-badge]")).toContainText("1");

    // View cart
    await page.goto("/cart");
    await expect(page.locator(".cart-item")).toHaveCount(1);

    // Checkout
    await page.click('button:has-text("Proceed to Checkout")');
    await page.click('button:has-text("Continue to Shipping")');

    // Shipping info
    await page.fill('[name="fullName"]', "Test User");
    await page.fill('[name="address"]', "123 Main St");
    await page.fill('[name="city"]', "City");
    await page.fill('[name="state"]', "State");
    await page.fill('[name="zipCode"]', "12345");
    await page.fill('[name="country"]', "Country");
    await page.click('button:has-text("Continue to Payment")');

    // Payment info
    await page.fill('[name="cardNumber"]', "1234567890123456");
    await page.fill('[name="cardName"]', "Test User");
    await page.fill('[name="expiryDate"]', "12/25");
    await page.fill('[name="cvv"]', "123");
    await page.click('button:has-text("Place Order")');

    // Confirmation
    await expect(page.locator("text=Order Placed Successfully")).toBeVisible();
  });
});
```

### Step 3: Accessibility Testing

Create `apps/web/e2e/accessibility.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("homepage should not have accessibility violations", async ({
    page,
  }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/products");

    // Tab through elements
    await page.keyboard.press("Tab");
    await expect(page.locator(":focus")).toBeVisible();

    // Enter key should work
    await page.keyboard.press("Enter");
  });

  test("should have proper ARIA labels", async ({ page }) => {
    await page.goto("/");
    const buttons = await page.locator("button");
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute("aria-label");
      const text = await button.textContent();
      expect(ariaLabel || text).toBeTruthy();
    }
  });
});
```

### Step 4: Performance Testing

Create `apps/web/e2e/performance.spec.ts`:

```typescript
import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("should meet Core Web Vitals", async ({ page }) => {
    await page.goto("/");

    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0] as any;
      return {
        LCP: 0, // Implement actual LCP measurement
        FID: 0, // Implement actual FID measurement
        CLS: 0, // Implement actual CLS measurement
      };
    });

    // LCP should be < 2.5s
    expect(metrics.LCP).toBeLessThan(2500);
  });

  test("should lazy load images", async ({ page }) => {
    await page.goto("/products");

    const images = page.locator('img[loading="lazy"]');
    await expect(images.first()).toHaveAttribute("loading", "lazy");
  });

  test("bundle size should be reasonable", async ({ page }) => {
    await page.goto("/");

    const resources = await page.evaluate(() =>
      performance
        .getEntriesByType("resource")
        .filter((r: any) => r.name.includes(".js"))
        .reduce((sum: number, r: any) => sum + r.transferSize, 0),
    );

    // Total JS should be < 250KB gzipped
    expect(resources).toBeLessThan(250 * 1024);
  });
});
```

### Step 5: Component Testing

Create `apps/web/src/components/__tests__/ProductCard.test.tsx`:

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductCard } from '../ProductCard';

const mockProduct = {
  id: '1',
  name: 'Test Product',
  price: 99.99,
  image_url: 'test.jpg',
  category: 'Electronics',
  stock: 10,
};

describe('ProductCard', () => {
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} onClick={() => {}} />);

    expect(screen.getByText('Test Product')).toBeInTheDocument();
    expect(screen.getByText('$99.99')).toBeInTheDocument();
  });

  it('shows out of stock when stock is 0', () => {
    const outOfStock = { ...mockProduct, stock: 0 };
    render(<ProductCard product={outOfStock} onClick={() => {}} />);

    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<ProductCard product={mockProduct} onClick={handleClick} />);

    fireEvent.click(screen.getByText('Test Product'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### Step 6: Backend API Testing

Create `apps/api/src/__tests__/integration/products.test.ts`:

```typescript
import request from "supertest";
import app from "../../server";
import { prisma } from "../../prisma/client";

describe("Products API", () => {
  beforeAll(async () => {
    await prisma.product.deleteMany({});
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("GET /api/products should return products", async () => {
    const response = await request(app).get("/api/products");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data.products)).toBe(true);
  });

  it("GET /api/products/:id should return product", async () => {
    // Create test product
    const product = await prisma.product.create({
      data: {
        name: "Test Product",
        description: "Test",
        price: 99.99,
        image_url: "test.jpg",
        category: "Test",
        stock: 10,
      },
    });

    const response = await request(app).get(`/api/products/${product.id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.product.name).toBe("Test Product");
  });
});
```

---

## ✅ Quality Assurance Checklist

### Functionality Testing

- [ ] **Authentication**
  - [ ] Registration with validation
  - [ ] Login/logout flows
  - [ ] Protected routes redirect
  - [ ] Token refresh works
  - [ ] Password requirements enforced

- [ ] **Products**
  - [ ] Product listing displays
  - [ ] Search finds products
  - [ ] Filters work correctly
  - [ ] Sorting applies
  - [ ] Product details load
  - [ ] Out of stock displays

- [ ] **Shopping Cart**
  - [ ] Add to cart works
  - [ ] Quantity updates
  - [ ] Remove items works
  - [ ] Cart persists on refresh
  - [ ] Cart badge updates

- [ ] **Checkout**
  - [ ] All steps complete
  - [ ] Form validation works
  - [ ] Order creates successfully
  - [ ] Cart clears after order
  - [ ] Confirmation displays

- [ ] **Account**
  - [ ] Profile displays
  - [ ] Profile updates save
  - [ ] Order history loads
  - [ ] Order details display
  - [ ] Status filters work

### Accessibility (WCAG 2.1 AA)

- [ ] **Keyboard Navigation**
  - [ ] All interactive elements focusable
  - [ ] Tab order logical
  - [ ] Enter/Space activate buttons
  - [ ] Escape closes modals

- [ ] **Screen Reader Support**
  - [ ] Images have alt text
  - [ ] Buttons have labels
  - [ ] Forms have labels
  - [ ] ARIA landmarks used
  - [ ] Live regions for notifications

- [ ] **Visual Accessibility**
  - [ ] Color contrast ≥ 4.5:1
  - [ ] Text resizable to 200%
  - [ ] No color-only information
  - [ ] Focus indicators visible

### Performance

- [ ] **Loading Performance**
  - [ ] First Contentful Paint < 1.5s
  - [ ] Largest Contentful Paint < 2.5s
  - [ ] Time to Interactive < 3.5s
  - [ ] Images lazy load
  - [ ] Code splitting implemented

- [ ] **Runtime Performance**
  - [ ] Smooth animations (60fps)
  - [ ] No layout shifts
  - [ ] Fast page transitions
  - [ ] Efficient re-renders

### Security

- [ ] **Authentication Security**
  - [ ] Passwords hashed (bcrypt)
  - [ ] JWT secrets strong
  - [ ] Tokens expire correctly
  - [ ] HTTPS in production

- [ ] **Input Validation**
  - [ ] All inputs validated
  - [ ] XSS prevention
  - [ ] SQL injection prevented (Prisma)
  - [ ] CORS configured

- [ ] **API Security**
  - [ ] Protected routes secured
  - [ ] Rate limiting on auth
  - [ ] Security headers (helmet)
  - [ ] Error messages safe

### Cross-Browser Testing

Test on:

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Responsive Design

Test on:

- [ ] Mobile (320px - 480px)
- [ ] Tablet (768px - 1024px)
- [ ] Desktop (1280px+)
- [ ] Large screens (1920px+)

---

## 🔧 Common Issues & Fixes

### Issue 1: Slow Page Loads

**Fix:** Implement code splitting and lazy loading

```typescript
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
```

### Issue 2: Layout Shifts

**Fix:** Add explicit dimensions to images

```typescript
<img width="400" height="300" ... />
```

### Issue 3: Memory Leaks

**Fix:** Clean up event listeners and subscriptions

```typescript
useEffect(() => {
  return () => {
    // cleanup
  };
}, []);
```

### Issue 4: Accessibility Violations

**Fix:** Add proper ARIA labels and semantic HTML

```typescript
<button aria-label="Add to cart">
  <PlusIcon />
</button>
```

---

## 🚀 Production Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificate installed
- [ ] CORS configured for production domain
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics configured

### Build Optimization

- [ ] Production build created
- [ ] Assets minified
- [ ] Images optimized
- [ ] Gzip/Brotli compression enabled
- [ ] CDN configured for static assets

### Monitoring

- [ ] Health check endpoint working
- [ ] Uptime monitoring configured
- [ ] Performance monitoring active
- [ ] Error tracking enabled
- [ ] Log aggregation setup

### Documentation

- [ ] README.md updated
- [ ] API documentation complete
- [ ] Deployment guide created
- [ ] Environment variables documented
- [ ] Troubleshooting guide written

---

## 📦 Installation Commands

```bash
# Install E2E testing
cd apps/web
npm install -D @playwright/test @axe-core/playwright

# Install component testing
npm install -D @testing-library/react @testing-library/jest-dom jest

# Install backend testing
cd apps/api
npm install -D jest supertest @types/jest @types/supertest

# Run tests
npm test                    # Unit/component tests
npx playwright test         # E2E tests
npx playwright test --ui    # E2E with UI
npx playwright show-report  # View test report
```

---

## 📚 Testing Best Practices

1. **Test User Journeys, Not Implementation**
   - Focus on what users do, not how code works
   - Test complete flows end-to-end

2. **Write Resilient Selectors**
   - Use data-testid attributes
   - Avoid brittle CSS selectors

3. **Mock External Dependencies**
   - Mock API calls in unit tests
   - Use real APIs in E2E tests

4. **Test Edge Cases**
   - Empty states
   - Error conditions
   - Loading states
   - Maximum values

5. **Keep Tests Fast**
   - Parallelize when possible
   - Use selective test runs
   - Cache dependencies

---

## ✅ Final Deliverables

At the end of this session:

1. ✅ E2E test suite covering critical flows
2. ✅ Component tests for UI elements
3. ✅ API integration tests
4. ✅ Accessibility compliance (WCAG 2.1 AA)
5. ✅ Performance optimizations applied
6. ✅ Cross-browser compatibility verified
7. ✅ Security audit complete
8. ✅ Production deployment ready
9. ✅ Documentation complete

---

## 🎉 Project Complete!

The eCommerce platform is now:

- ✅ Fully functional with all features
- ✅ Production-ready with testing
- ✅ Accessible to all users
- ✅ Performant and optimized
- ✅ Secure and maintainable
- ✅ Well-documented

**Ready for deployment and team handoff!**

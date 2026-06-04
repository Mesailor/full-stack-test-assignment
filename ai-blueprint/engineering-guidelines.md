# Engineering Guidelines & Constraints

## Overview

This document defines the conventions, standards, and constraints that AI agents must consistently follow when generating code for this eCommerce platform. These guidelines ensure consistency, maintainability, and production-grade quality across the entire codebase.

---

## 1. Language & Framework Standards

### TypeScript Everywhere

- **Strict Mode**: All TypeScript configuration must use strict mode
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "noImplicitAny": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noImplicitReturns": true
    }
  }
  ```
- **Explicit Types**: Always define explicit return types for functions
- **No `any` Type**: Avoid using `any`; use `unknown` with type guards if needed
- **Type-Safe APIs**: All API contracts must use shared TypeScript types

### React 18+ Standards

- **Functional Components**: Use function components with hooks exclusively
- **TypeScript Props**: Always define typed interfaces for component props
- **Hooks Rules**: Follow ESLint rules of hooks strictly
- **Error Boundaries**: Implement error boundaries for production-grade error handling
- **Lazy Loading**: Use React.lazy() for route-based code splitting

### Node.js & Express Standards

- **Async/Await**: Use async/await instead of callbacks or raw promises
- **Express TypeScript**: Use typed Request/Response with custom interfaces
- **Middleware Typing**: Properly type all middleware functions
- **Error Handling**: Implement centralized error handling middleware

---

## 2. Project Architecture

### Turborepo Monorepo Structure

```
/
├── apps/
│   ├── web/              # React frontend application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── stores/    # Zustand stores
│   │   │   ├── hooks/
│   │   │   ├── services/  # API service layer
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── public/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── api/              # Express backend application
│       ├── src/
│       │   ├── controllers/
│       │   ├── routes/
│       │   ├── middleware/
│       │   ├── services/
│       │   ├── prisma/    # Prisma schema and migrations
│       │   ├── types/
│       │   └── utils/
│       ├── package.json
│       └── tsconfig.json
│
├── packages/
│   ├── ui/               # Shared React components
│   │   └── src/
│   │       ├── components/
│   │       └── index.ts
│   │
│   ├── types/            # Shared TypeScript types
│   │   └── src/
│   │       ├── api.ts    # API request/response types
│   │       ├── models.ts # Database model types
│   │       └── index.ts
│   │
│   ├── config/           # Shared configurations
│   │   ├── eslint-config/
│   │   ├── typescript-config/
│   │   └── tailwind-config/
│   │
│   └── utils/            # Shared utility functions
│       └── src/
│           ├── validators/
│           ├── formatters/
│           └── index.ts
│
├── DESIGN.md            # Design system specification
├── turborepo.json       # Turborepo configuration
└── package.json         # Root package.json
```

### Feature-Based Organization

- Organize code by feature/domain rather than technical layer
- Each feature should contain its own components, hooks, and types
- Example: `src/features/auth/`, `src/features/cart/`, `src/features/products/`

---

## 3. Naming Conventions

### Files & Folders

- **React Components**: PascalCase (e.g., `ProductCard.tsx`, `CheckoutForm.tsx`)
- **TypeScript Files**: kebab-case (e.g., `api-client.ts`, `user-service.ts`)
- **Folders**: kebab-case (e.g., `user-profile/`, `product-catalog/`)
- **Test Files**: `*.test.ts` or `*.spec.ts` suffix
- **Type Definition Files**: `*.types.ts` suffix

### Code Identifiers

- **Components**: PascalCase (e.g., `UserProfile`, `ProductGrid`)
- **Functions**: camelCase (e.g., `fetchProducts`, `validateEmail`)
- **Variables**: camelCase (e.g., `userId`, `productList`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_CART_ITEMS`)
- **Interfaces**: PascalCase with `I` prefix optional (e.g., `User` or `IUser`)
- **Types**: PascalCase (e.g., `ProductType`, `AuthState`)
- **Enums**: PascalCase for enum name, UPPER_SNAKE_CASE for values

### Database & API

- **Table Names**: snake_case plural (e.g., `users`, `product_categories`)
- **Column Names**: snake_case (e.g., `created_at`, `user_id`)
- **API Endpoints**: kebab-case (e.g., `/api/products`, `/api/order-history`)
- **HTTP Methods**: Use proper REST verbs (GET, POST, PUT, PATCH, DELETE)

---

## 4. Code Standards & Quality

### ESLint & Prettier Configuration

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off"
  }
}
```

### Import Ordering

1. External dependencies (React, Express, etc.)
2. Internal packages (@repo/ui, @repo/types)
3. Relative imports (../../components)
4. Style imports (CSS, Tailwind)

Example:

```typescript
// External
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Internal packages
import { Button } from "@repo/ui";
import type { Product } from "@repo/types";

// Relative
import { ProductCard } from "../../components/ProductCard";
import { useCart } from "../../hooks/useCart";

// Styles
import "./ProductList.css";
```

### Code Organization

- **Single Responsibility**: Each function/component should do one thing well
- **DRY Principle**: Avoid code duplication; extract reusable logic
- **Small Functions**: Keep functions under 50 lines when possible
- **Meaningful Names**: Use descriptive names that explain intent
- **Comments**: Write comments for complex logic, not obvious code

---

## 5. Error Handling

### Frontend Error Handling

```typescript
// React Error Boundary for component errors
class ErrorBoundary extends React.Component<Props, State> {
  // Implementation with proper typing
}

// API error handling with typed responses
try {
  const response = await api.fetchProducts();
  setProducts(response.data);
} catch (error) {
  if (error instanceof ApiError) {
    showNotification(error.message);
  } else {
    showNotification("An unexpected error occurred");
  }
}
```

### Backend Error Handling

```typescript
// Custom error classes
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true,
  ) {
    super(message);
  }
}

// Centralized error middleware
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  // Proper error response with typing
};
```

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}
```

---

## 6. Security Guidelines

### Authentication & Authorization

- **Password Hashing**: Use bcrypt with salt rounds >= 10
- **JWT Tokens**: Store securely, implement refresh token rotation
- **HTTP-Only Cookies**: Use for token storage when possible
- **Token Expiration**: Access tokens expire in 15min, refresh tokens in 7 days
- **Protected Routes**: Verify JWT on all protected API endpoints

### Input Validation

- **Validate All Inputs**: Use Zod for runtime type validation
- **Sanitize User Input**: Prevent XSS attacks
- **SQL Injection Prevention**: Use Prisma parameterized queries (built-in)
- **Rate Limiting**: Implement rate limiting on authentication endpoints

### CORS & Headers

```typescript
// CORS configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

// Security headers
app.use(helmet());
```

---

## 7. Testing Strategy

### Frontend Testing (Jest + React Testing Library)

```typescript
// Component tests
describe('ProductCard', () => {
  it('should render product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
  });
});

// Hook tests
describe('useCart', () => {
  it('should add item to cart', () => {
    const { result } = renderHook(() => useCart());
    act(() => {
      result.current.addItem(mockProduct);
    });
    expect(result.current.items).toHaveLength(1);
  });
});
```

### Backend Testing (Jest + Supertest)

```typescript
// API endpoint tests
describe("POST /api/auth/login", () => {
  it("should return token for valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });
});
```

### Test Coverage Requirements

- **Minimum Coverage**: 80% for critical business logic
- **Component Coverage**: All user-facing components must be tested
- **API Coverage**: All endpoints must have integration tests
- **Edge Cases**: Test error conditions and edge cases

---

## 8. Performance Standards

### Frontend Performance

- **Bundle Size**: Main bundle < 250KB gzipped
- **Lazy Loading**: Implement code splitting for routes
- **Image Optimization**: Use WebP format, lazy load images
- **Memoization**: Use React.memo, useMemo, useCallback appropriately
- **Virtual Scrolling**: For long lists (react-window or similar)

### Backend Performance

- **Response Time**: API responses < 200ms for simple queries
- **Database Queries**: Use Prisma's include/select to optimize queries
- **Connection Pooling**: Configure Prisma connection pooling
- **Caching**: Implement caching for frequently accessed data
- **Pagination**: Always paginate large data sets

---

## 9. Development Workflow

### Git Workflow

- **Branch Naming**: `feature/`, `bugfix/`, `hotfix/` prefixes
- **Commit Messages**: Use conventional commits (feat:, fix:, chore:)
- **Pull Requests**: Require tests and type checks to pass

### Environment Variables

```bash
# apps/web/.env.local
VITE_API_URL=http://localhost:3001/api

# apps/api/.env
DATABASE_URL="mysql://user:pass@localhost:3306/ecommerce"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
```

### Running the Application

```bash
# Install dependencies
npm install

# Run development servers
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Type checking
npm run type-check
```

---

## 10. Design System Integration

### Reference DESIGN.md

All visual styling must reference `/DESIGN.md` for:

- **Color Palette**: Primary (#FECE14), Secondary (#000000), Success, Warning, Danger
- **Typography**: Poppins (primary), IBM Plex Mono (code/labels)
- **Spacing Scale**: 4/8/12/16/24/32 pixel increments
- **Border Radius**: sm (4px), md (8px)

### Tailwind Configuration

```javascript
// packages/config/tailwind-config/tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#FECE14",
        secondary: "#000000",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      spacing: {
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        24: "24px",
        32: "32px",
      },
    },
  },
};
```

---

## 11. Modern Web Standards

### Use modern-web-guidance Skill

**MANDATORY**: Execute the `modern-web-guidance` skill for all frontend development tasks to ensure:

- Modern HTML/CSS patterns (`:has()`, container queries, View Transitions)
- Scroll-driven animations and parallax effects
- Performance optimizations (content-visibility, Fetch Priority)
- Accessibility best practices (ARIA, semantic HTML)
- Modern form features (autofill, validation)

---

## Summary

These guidelines serve as the foundation for AI-driven development. Every generated file, component, and API endpoint must adhere to these standards to ensure a cohesive, maintainable, and production-grade eCommerce platform.

**Key Principles:**

1. TypeScript strict mode everywhere
2. Consistent naming and structure
3. Comprehensive error handling
4. Security-first approach
5. Test-driven development
6. Performance optimization
7. Design system adherence
8. Modern web standards

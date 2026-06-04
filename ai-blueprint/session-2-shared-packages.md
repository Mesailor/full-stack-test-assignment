# Session 2: Shared Packages & Design System

## 🎯 Session Objectives

Build the shared package infrastructure that will be used across frontend and backend:

- Shared TypeScript types and API contracts
- Reusable UI component library with design system
- Shared configuration packages (ESLint, TypeScript, Tailwind)
- Shared utility functions and validators

**Duration Estimate:** 2-3 hours  
**Dependencies:** Session 1 (Foundation & Database)

---

## 📋 Required Context

Before starting, review these documents:

1. **`/DESIGN.md`** - Design system specification (colors, typography, spacing)
2. **`/ai-blueprint/capability-definitions.md`** - UI component patterns
3. **`/ai-blueprint/engineering-guidelines.md`** - Code standards and naming conventions
4. **`/ai-blueprint/architecture.md`** - Monorepo structure

---

## 🏗 Implementation Steps

### Step 1: Create Shared Types Package

#### 1.1 Initialize Types Package

Create `packages/types/package.json`:

```json
{
  "name": "@repo/types",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

#### 1.2 Configure TypeScript

Create `packages/types/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "bundler",
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

#### 1.3 Create Type Definitions

Create `packages/types/src/models.ts`:

```typescript
// Database model types
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
  stock: number;
  created_at: Date;
  updated_at: Date;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  created_at: Date;
  product?: Product;
}

export enum OrderStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  created_at: Date;
  updated_at: Date;
  order_items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product?: Product;
}
```

Create `packages/types/src/api.ts`:

```typescript
import { User, Product, CartItem, Order, OrderStatus } from "./models";

// Common API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Product API types
export interface ProductListQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "name";
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  meta: PaginationMeta;
}

// Cart API types
export interface AddToCartRequest {
  product_id: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Order API types
export interface CreateOrderRequest {
  shipping_address: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  total_amount: number;
}

export interface OrderListQuery {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface OrderListResponse {
  orders: Order[];
  meta: PaginationMeta;
}

// User API types
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface UserProfileResponse {
  user: User;
}
```

Create `packages/types/src/common.ts`:

```typescript
// Common utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
  T,
  Exclude<keyof T, Keys>
> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Nullable<T> = T | null;

export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

// Form types
export interface FormField<T = string> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

export interface NotificationType {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
  duration?: number;
}
```

Create `packages/types/src/index.ts`:

```typescript
// Export all types
export * from "./models";
export * from "./api";
export * from "./common";
```

### Step 2: Create Shared Configuration Packages

#### 2.1 TypeScript Config Package

Create `packages/config/typescript-config/package.json`:

```json
{
  "name": "@repo/typescript-config",
  "version": "1.0.0",
  "private": true,
  "main": "base.json"
}
```

Create `packages/config/typescript-config/base.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true
  }
}
```

Create `packages/config/typescript-config/react.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "noEmit": true
  }
}
```

Create `packages/config/typescript-config/node.json`:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

#### 2.2 Tailwind Config Package

Create `packages/config/tailwind-config/package.json`:

```json
{
  "name": "@repo/tailwind-config",
  "version": "1.0.0",
  "private": true,
  "main": "tailwind.config.js",
  "dependencies": {
    "tailwindcss": "^3.4.0"
  }
}
```

Create `packages/config/tailwind-config/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {
      colors: {
        primary: "#FECE14",
        secondary: "#000000",
        success: "#16A34A",
        warning: "#D97706",
        danger: "#DC2626",
        surface: "#FFFFFF",
        text: "#111827",
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      fontSize: {
        h1: "3rem",
        "body-md": "1rem",
        "label-caps": "0.75rem",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },
      borderRadius: {
        sm: "4px",
        md: "8px",
      },
    },
  },
  plugins: [],
};
```

Create `packages/config/tailwind-config/README.md`:

```markdown
# Tailwind Config

Shared Tailwind CSS configuration based on DESIGN.md.

## Usage

In your app's `tailwind.config.js`:

\`\`\`javascript
const baseConfig = require("@repo/tailwind-config/tailwind.config");

module.exports = {
...baseConfig,
content: ["./src/**/*.{js,jsx,ts,tsx}"],
};
\`\`\`
```

### Step 3: Create Shared Utils Package

Create `packages/utils/package.json`:

```json
{
  "name": "@repo/utils",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

Create `packages/utils/tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Create `packages/utils/src/validators.ts`:

```typescript
import { z } from "zod";

// Auth validation schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain uppercase, lowercase, and number",
    ),
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
});

// Product validation schemas
export const productFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  sortBy: z
    .enum(["price_asc", "price_desc", "newest", "name"])
    .optional()
    .default("newest"),
  page: z.number().int().min(1).optional().default(1),
  limit: z.number().int().min(1).max(100).optional().default(20),
});

// Cart validation schemas
export const addToCartSchema = z.object({
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1).optional().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1),
});

// Order validation schemas
export const createOrderSchema = z.object({
  shipping_address: z.string().min(10, "Shipping address is too short"),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1),
        price: z.number().min(0),
      }),
    )
    .min(1, "Order must contain at least one item"),
  total_amount: z.number().min(0),
});

// Profile validation schema
export const updateProfileSchema = z.object({
  first_name: z.string().min(2).optional(),
  last_name: z.string().min(2).optional(),
  email: z.string().email().optional(),
});

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
```

Create `packages/utils/src/formatters.ts`:

```typescript
// Currency formatter
export const formatCurrency = (amount: number, currency = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

// Date formatter
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
};

export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
};

// Number formatter
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-US").format(num);
};

// String utilities
export const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
};

export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Generate UUID (simple version)
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15);
};
```

Create `packages/utils/src/index.ts`:

```typescript
export * from "./validators";
export * from "./formatters";
```

### Step 4: Create Shared UI Package

Create `packages/ui/package.json`:

```json
{
  "name": "@repo/ui",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "type-check": "tsc --noEmit",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "react": "^18.2.0",
    "framer-motion": "^10.16.16"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "typescript": "^5.3.3"
  },
  "peerDependencies": {
    "react": "^18.0.0"
  }
}
```

Create `packages/ui/tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/react.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Create directory structure:

```bash
mkdir -p packages/ui/src/components
```

Create `packages/ui/src/components/Button.tsx`:

```typescript
import { ButtonHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button = ({
  variant = "primary",
  size = "md",
  children,
  isLoading = false,
  fullWidth = false,
  disabled,
  className = "",
  ...props
}: ButtonProps) => {
  const baseClasses =
    "font-sans font-semibold rounded-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary:
      "bg-primary text-secondary hover:bg-yellow-500 focus:ring-primary",
    secondary:
      "bg-secondary text-surface hover:bg-gray-800 focus:ring-secondary",
    outline:
      "border-2 border-secondary text-secondary hover:bg-secondary hover:text-surface focus:ring-secondary",
    danger: "bg-danger text-surface hover:bg-red-700 focus:ring-danger",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <motion.button
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center">
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
};
```

Create `packages/ui/src/components/Card.tsx`:

```typescript
import { ReactNode } from "react";
import { motion } from "framer-motion";

export interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = ({
  children,
  className = "",
  hover = false,
  padding = "md",
}: CardProps) => {
  const paddingClasses = {
    none: "",
    sm: "p-2",
    md: "p-4",
    lg: "p-6",
  };

  const baseClasses = `bg-surface rounded-md shadow-md ${paddingClasses[padding]} ${className}`;

  if (hover) {
    return (
      <motion.div
        className={baseClasses}
        whileHover={{
          y: -4,
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    );
  }

  return <div className={baseClasses}>{children}</div>;
};
```

Create `packages/ui/src/components/Input.tsx`:

```typescript
import { forwardRef, InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    const inputClasses = `
      w-full px-4 py-2 border rounded-sm
      font-sans text-base
      focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${error ? "border-danger" : "border-gray-300"}
      ${className}
    `;

    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="font-mono text-label-caps uppercase text-text font-medium">
            {label}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && <span className="text-danger text-sm">{error}</span>}
        {helperText && !error && (
          <span className="text-gray-500 text-sm">{helperText}</span>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
```

Create `packages/ui/src/components/Modal.tsx`:

```typescript
import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
}: ModalProps) => {
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`bg-surface rounded-md shadow-xl w-full ${sizeClasses[size]} p-6`}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold font-sans">{title}</h2>
                  <button
                    onClick={onClose}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>
              )}
              {children}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
```

Create `packages/ui/src/components/Spinner.tsx`:

```typescript
export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
}

export const Spinner = ({ size = "md", color = "currentColor" }: SpinnerProps) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <svg
      className={`animate-spin ${sizeClasses[size]}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke={color}
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill={color}
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};
```

Create `packages/ui/src/index.ts`:

```typescript
// Export all components
export * from "./components/Button";
export * from "./components/Card";
export * from "./components/Input";
export * from "./components/Modal";
export * from "./components/Spinner";
```

---

## ✅ Quality Assessment Criteria

### Verification Checklist

Before moving to the next session, verify:

- [ ] **Shared Types Package**
  - [ ] All model types defined (User, Product, CartItem, Order, OrderItem)
  - [ ] API request/response types complete
  - [ ] Common utility types available
  - [ ] Package exports working correctly

- [ ] **Configuration Packages**
  - [ ] TypeScript configs created (base, react, node)
  - [ ] Tailwind config matches DESIGN.md specifications
  - [ ] All color values correct (#FECE14, #000000, etc.)
  - [ ] Font families configured (Poppins, IBM Plex Mono)
  - [ ] Spacing scale correct (4/8/12/16/24/32)

- [ ] **Utilities Package**
  - [ ] Zod validation schemas complete
  - [ ] Formatter functions working
  - [ ] All validators exported correctly

- [ ] **UI Components Package**
  - [ ] Button component with all variants
  - [ ] Card component with hover effect
  - [ ] Input component with error handling
  - [ ] Modal component with animations
  - [ ] Spinner component
  - [ ] All components use design tokens

### Testing Commands

Run these commands to verify setup:

```bash
# Install all dependencies from root
npm install

# Type check all packages
cd packages/types && npm run type-check
cd packages/utils && npm run type-check
cd packages/ui && npm run type-check

# Verify imports
node -e "console.log(require('./packages/types/src/index.ts'))"
```

### Manual Verification

1. **Design System Alignment:**
   - Open `packages/config/tailwind-config/tailwind.config.js`
   - Verify primary color is `#FECE14`
   - Verify secondary color is `#000000`
   - Verify font families are Poppins and IBM Plex Mono
   - Verify spacing values: 4, 8, 12, 16, 24, 32

2. **Type Definitions:**
   - Open `packages/types/src/models.ts`
   - Verify all 5 models exist: User, Product, CartItem, Order, OrderItem
   - Verify OrderStatus enum has 5 values

3. **UI Components:**
   - Check Button component has 4 variants
   - Check Card component has hover animation
   - Check Input component has error state
   - Check Modal component uses framer-motion

---

## 📦 Deliverables

At the end of this session, you should have:

1. ✅ `@repo/types` - Shared TypeScript types
2. ✅ `@repo/typescript-config` - TypeScript configurations
3. ✅ `@repo/tailwind-config` - Tailwind CSS with design tokens
4. ✅ `@repo/utils` - Validators and formatters
5. ✅ `@repo/ui` - Reusable React components
6. ✅ All packages properly configured with TypeScript
7. ✅ Design system implemented per DESIGN.md
8. ✅ Component library ready for use

---

## 🔄 Next Session

**Session 3: Backend - Authentication System**

Will cover:

- JWT token generation and verification
- Auth endpoints (register, login, refresh, logout)
- Auth middleware for protected routes
- Password hashing with bcrypt
- Error handling middleware

---

## 📚 Reference Documents

- `/DESIGN.md` - Design system specification
- `/ai-blueprint/capability-definitions.md` - Reusable patterns
- `/ai-blueprint/engineering-guidelines.md` - Code standards
- Framer Motion: https://www.framer.com/motion/
- Zod: https://zod.dev/

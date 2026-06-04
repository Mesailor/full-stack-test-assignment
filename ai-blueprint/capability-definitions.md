# Capability Definitions

## Overview

This document describes the functional building blocks, reusable modules, and integration patterns that AI agents can leverage while generating the eCommerce application. These capabilities represent the core domains and technical components that form the foundation of the platform.

---

## 1. Authentication Module

### JWT-Based Authentication System

#### Password Security

```typescript
// Using bcrypt for password hashing
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return await bcrypt.compare(password, hash);
};
```

#### Token Management

```typescript
import jwt from "jsonwebtoken";

interface TokenPayload {
  userId: string;
  email: string;
}

// Access token (short-lived)
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "15m",
  });
};

// Refresh token (long-lived)
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: "7d",
  });
};

// Verify token
export const verifyToken = (token: string, secret: string): TokenPayload => {
  return jwt.verify(token, secret) as TokenPayload;
};
```

#### Protected Route Middleware

```typescript
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: TokenPayload;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const payload = verifyToken(token, process.env.JWT_SECRET!);
    req.user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
```

#### Auth Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Token invalidation
- `GET /api/auth/me` - Get current user (protected)

---

## 2. Prisma Data Access Layer

### Database Configuration

#### Prisma Schema Structure

```prisma
// apps/api/src/prisma/schema.prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password_hash String
  first_name    String
  last_name     String
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
  orders        Order[]
  cart_items    CartItem[]

  @@map("users")
}

model Product {
  id          String      @id @default(uuid())
  name        String
  description String      @db.Text
  price       Decimal     @db.Decimal(10, 2)
  image_url   String
  category    String
  stock       Int         @default(0)
  created_at  DateTime    @default(now())
  updated_at  DateTime    @updatedAt
  cart_items  CartItem[]
  order_items OrderItem[]

  @@index([category])
  @@map("products")
}

model CartItem {
  id         String   @id @default(uuid())
  user_id    String
  product_id String
  quantity   Int      @default(1)
  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  product    Product  @relation(fields: [product_id], references: [id])
  created_at DateTime @default(now())

  @@unique([user_id, product_id])
  @@map("cart_items")
}

model Order {
  id              String      @id @default(uuid())
  user_id         String
  status          OrderStatus @default(PENDING)
  total_amount    Decimal     @db.Decimal(10, 2)
  shipping_address String     @db.Text
  created_at      DateTime    @default(now())
  updated_at      DateTime    @updatedAt
  user            User        @relation(fields: [user_id], references: [id])
  order_items     OrderItem[]

  @@index([user_id])
  @@map("orders")
}

model OrderItem {
  id         String  @id @default(uuid())
  order_id   String
  product_id String
  quantity   Int
  price      Decimal @db.Decimal(10, 2)
  order      Order   @relation(fields: [order_id], references: [id], onDelete: Cascade)
  product    Product @relation(fields: [product_id], references: [id])

  @@map("order_items")
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

#### Prisma Client Singleton

```typescript
// apps/api/src/prisma/client.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

#### Migration Commands

```bash
# Create a new migration
npx prisma migrate dev --name init

# Apply migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate

# Seed database
npx prisma db seed
```

#### Type-Safe Queries

```typescript
// Get products with filtering
export const getProducts = async (filters: {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
}) => {
  return await prisma.product.findMany({
    where: {
      ...(filters.category && { category: filters.category }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search } },
          { description: { contains: filters.search } },
        ],
      }),
      ...(filters.minPrice && { price: { gte: filters.minPrice } }),
      ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
    },
    orderBy: { created_at: "desc" },
  });
};

// Get user with orders
export const getUserWithOrders = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      orders: {
        include: {
          order_items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      },
    },
  });
};
```

---

## 3. Zustand State Management

### Store Structure

#### Auth Store

```typescript
// apps/web/src/stores/auth.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken, isAuthenticated: true }),

      setUser: (user) => set({ user }),

      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        refreshToken: state.refreshToken,
      }),
    },
  ),
);
```

#### Cart Store

```typescript
// apps/web/src/stores/cart.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

interface CartState {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === item.productId,
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + 1 }
                  : i,
              ),
            };
          }
          return { items: [...state.items, { ...item, quantity: 1 }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i,
          ),
        })),

      clearCart: () => set({ items: [] }),

      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage",
    },
  ),
);
```

#### UI Store

```typescript
// apps/web/src/stores/ui.store.ts
import { create } from "zustand";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  message: string;
}

interface UIState {
  isCartOpen: boolean;
  isMobileMenuOpen: boolean;
  notifications: Notification[];

  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleMobileMenu: () => void;

  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isCartOpen: false,
  isMobileMenuOpen: false,
  notifications: [],

  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),

  openMobileMenu: () => set({ isMobileMenuOpen: true }),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: Math.random().toString(36) },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
```

---

## 4. UI Component System

### Design Token Integration

All components must use design tokens from `/DESIGN.md`:

```typescript
// packages/config/tailwind-config/design-tokens.ts
export const designTokens = {
  colors: {
    primary: "#FECE14",
    secondary: "#000000",
    success: "#16A34A",
    warning: "#D97706",
    danger: "#DC2626",
    surface: "#FFFFFF",
    text: "#111827",
  },
  fonts: {
    sans: ["Poppins", "sans-serif"],
    mono: ["IBM Plex Mono", "monospace"],
  },
  spacing: {
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    "2xl": "24px",
    "3xl": "32px",
  },
  borderRadius: {
    sm: "4px",
    md: "8px",
  },
};
```

### Core Reusable Components

#### Button Component

```typescript
// packages/ui/src/components/Button.tsx
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading,
  disabled,
  ...props
}: ButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={disabled || isLoading}
      className={`btn btn-${variant} btn-${size}`}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </motion.button>
  );
};
```

#### Card Component

```typescript
// packages/ui/src/components/Card.tsx
interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false }: CardProps) => {
  return (
    <motion.div
      className={`bg-surface rounded-md shadow-md p-4 ${className}`}
      whileHover={hover ? { y: -4, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' } : {}}
    >
      {children}
    </motion.div>
  );
};
```

#### Input Component

```typescript
// packages/ui/src/components/Input.tsx
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        {label && (
          <label className="font-mono text-xs uppercase text-text">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`px-4 py-2 border rounded-sm ${
            error ? 'border-danger' : 'border-gray-300'
          }`}
          {...props}
        />
        {error && <span className="text-danger text-sm">{error}</span>}
      </div>
    );
  }
);
```

#### Modal Component

```typescript
// packages/ui/src/components/Modal.tsx
import { AnimatePresence, motion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-surface rounded-md shadow-xl max-w-md w-full p-6">
              {title && <h2 className="text-2xl font-bold mb-4">{title}</h2>}
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
```

---

## 5. API Design Patterns

### RESTful Route Structure

```
/api/auth
  POST /register
  POST /login
  POST /refresh
  POST /logout
  GET  /me

/api/products
  GET    /          (list with filters)
  GET    /:id       (single product)
  POST   /          (admin)
  PUT    /:id       (admin)
  DELETE /:id       (admin)

/api/cart
  GET    /          (user's cart)
  POST   /items     (add to cart)
  PUT    /items/:id (update quantity)
  DELETE /items/:id (remove from cart)
  DELETE /          (clear cart)

/api/orders
  GET  /          (user's orders)
  GET  /:id       (order details)
  POST /          (create order)

/api/users
  GET  /profile   (current user)
  PUT  /profile   (update profile)
```

### Request Validation with Zod

```typescript
// apps/api/src/utils/validators.ts
import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

export const productFilterSchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        next(error);
      }
    }
  };
};
```

### API Response Format

```typescript
// Success response
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

// Error response
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

## 6. Service Layer Pattern

### API Service (Frontend)

```typescript
// apps/web/src/services/api.service.ts
import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        const response = await axios.post("/api/auth/refresh", {
          refreshToken,
        });
        const { accessToken } = response.data;

        useAuthStore.getState().setTokens(accessToken, refreshToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export { api };
```

---

## 7. Modern Web Features

### Leverage modern-web-guidance Skill

**MANDATORY**: Use the `modern-web-guidance` skill for:

1. **View Transitions API** - Smooth page transitions
2. **Scroll-driven Animations** - Parallax effects, fade-ins
3. **Container Queries** - Responsive component design
4. **:has() Pseudo-class** - Advanced CSS selectors
5. **content-visibility** - Performance optimization
6. **Modern Form Features** - Autofill, validation states

---

## Summary

These capability definitions provide reusable patterns and modules that ensure:

- **Consistent authentication** across the platform
- **Type-safe database access** with Prisma
- **Predictable state management** with Zustand
- **Reusable UI components** with Framer Motion
- **Robust API design** with validation and error handling
- **Modern web standards** via modern-web-guidance skill

AI agents should reference these patterns when building features to maintain consistency and quality.

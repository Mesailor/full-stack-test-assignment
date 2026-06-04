# Session 6: Frontend - Core Setup & Authentication

## 🎯 Session Objectives

Set up the React frontend foundation and implement authentication:

- Vite + React + TypeScript setup
- Zustand stores (auth, cart, UI)
- API service layer with Axios interceptors
- React Router with protected routes
- Login and Register pages
- Design system integration (Tailwind + DESIGN.md)

**Duration Estimate:** 3-4 hours  
**Dependencies:** Sessions 1-2 (Foundation, Shared Packages)

---

## 📋 Required Context

**IMPORTANT**: Execute `modern-web-guidance` skill first for modern web APIs!

1. **`/DESIGN.md`** - Design system (colors, typography, spacing)
2. **`/ai-blueprint/capability-definitions.md`** - Zustand patterns, UI components
3. **`/ai-blueprint/architecture.md`** - Frontend structure
4. **Session 2** - Shared packages (@repo/ui, @repo/types, @repo/utils)

---

## 🏗 Implementation Steps

### Step 1: Initialize React App with Vite

```bash
cd apps
npm create vite@latest web -- --template react-ts
cd web

# Install dependencies
npm install react-router-dom@^6.20.0 zustand@^4.4.7 axios@^1.6.2 \
  framer-motion@^10.16.16 react-hook-form@^7.49.2 \
  @repo/ui@workspace:* @repo/types@workspace:* @repo/utils@workspace:*

# Install dev dependencies
npm install -D tailwindcss@^3.4.0 autoprefixer@^10.4.16 postcss@^8.4.32 \
  @repo/tailwind-config@workspace:*
```

### Step 2: Configure Vite

Update `apps/web/vite.config.ts`:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
```

### Step 3: Configure Tailwind CSS

Create `apps/web/tailwind.config.js`:

```javascript
const baseConfig = require("@repo/tailwind-config/tailwind.config");

module.exports = {
  ...baseConfig,
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
  ],
};
```

Create `apps/web/postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Create `apps/web/src/index.css`:

```css
@import url("https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Poppins:wght@400;500;600;700&display=swap");

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply font-sans text-text bg-surface;
  }
}
```

### Step 4: Create Environment Configuration

Create `apps/web/.env.local`:

```bash
VITE_API_URL=http://localhost:3001/api
```

### Step 5: Create API Service Layer

Create `apps/web/src/services/api.ts`:

```typescript
import axios from "axios";
import { useAuthStore } from "../stores/auth.store";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        useAuthStore.getState().setTokens(accessToken, refreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
```

Create `apps/web/src/services/auth.service.ts`:

```typescript
import { api } from "./api";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@repo/types";

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/login", data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data.data.user;
  },
};
```

### Step 6: Create Zustand Stores

Create `apps/web/src/stores/auth.store.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@repo/types";

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

Create `apps/web/src/stores/cart.store.ts`:

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@repo/types";

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

  addItem: (product: Product, quantity?: number) => void;
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

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existingItem = state.items.find(
            (i) => i.productId === product.id,
          );
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.productId === product.id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                id: product.id,
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity,
                imageUrl: product.image_url,
              },
            ],
          };
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

Create `apps/web/src/stores/ui.store.ts`:

```typescript
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

### Step 7: Create Auth Pages

Create `apps/web/src/pages/Login.tsx`:

```typescript
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button, Input } from "@repo/ui";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";
import type { LoginRequest } from "@repo/types";

export const Login = () => {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.login(data);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-surface p-8 rounded-md shadow-md">
          <h1 className="text-3xl font-bold text-center mb-8">Login</h1>

          {error && (
            <div className="bg-red-50 text-danger p-3 rounded-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              {...register("email", { required: "Email is required" })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              {...register("password", { required: "Password is required" })}
              error={errors.password?.message}
            />

            <Button type="submit" isLoading={isLoading} fullWidth>
              Login
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
```

Create `apps/web/src/pages/Register.tsx`:

```typescript
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button, Input } from "@repo/ui";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";
import type { RegisterRequest } from "@repo/types";

export const Register = () => {
  const navigate = useNavigate();
  const { setTokens, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterRequest>();

  const onSubmit = async (data: RegisterRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await authService.register(data);
      setTokens(response.accessToken, response.refreshToken);
      setUser(response.user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.error?.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-surface p-8 rounded-md shadow-md">
          <h1 className="text-3xl font-bold text-center mb-8">Register</h1>

          {error && (
            <div className="bg-red-50 text-danger p-3 rounded-sm mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="First Name"
              {...register("first_name", {
                required: "First name is required",
              })}
              error={errors.first_name?.message}
            />

            <Input
              label="Last Name"
              {...register("last_name", { required: "Last name is required" })}
              error={errors.last_name?.message}
            />

            <Input
              label="Email"
              type="email"
              {...register("email", { required: "Email is required" })}
              error={errors.email?.message}
            />

            <Input
              label="Password"
              type="password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters",
                },
              })}
              error={errors.password?.message}
            />

            <Button type="submit" isLoading={isLoading} fullWidth>
              Register
            </Button>
          </form>

          <p className="text-center mt-6 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
```

### Step 8: Create Protected Route Component

Create `apps/web/src/components/ProtectedRoute.tsx`:

```typescript
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### Step 9: Create Home Page (Placeholder)

Create `apps/web/src/pages/Home.tsx`:

```typescript
export const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to eCommerce</h1>
        <p className="text-gray-600">
          Premium shopping experience awaits you
        </p>
      </div>
    </div>
  );
};
```

### Step 10: Set Up Router

Create `apps/web/src/App.tsx`:

```typescript
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

Update `apps/web/src/main.tsx`:

```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Step 11: Update Package.json

Update `apps/web/package.json`:

```json
{
  "name": "@repo/web",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

---

## ✅ Quality Assessment Criteria

### Verification Checklist

- [ ] **Vite Setup**
  - [ ] React + TypeScript working
  - [ ] Tailwind CSS configured with design tokens
  - [ ] Environment variables loading
  - [ ] Dev server running on port 5173

- [ ] **Design System**
  - [ ] Fonts loading (Poppins, IBM Plex Mono)
  - [ ] Colors matching DESIGN.md
  - [ ] Spacing scale correct

- [ ] **Zustand Stores**
  - [ ] Auth store persisting refresh token
  - [ ] Cart store working
  - [ ] UI store managing notifications

- [ ] **API Layer**
  - [ ] Axios instance configured
  - [ ] Token interceptor adding auth header
  - [ ] Token refresh on 401 working
  - [ ] Auth service methods working

- [ ] **Auth Pages**
  - [ ] Login page renders and functions
  - [ ] Register page renders and functions
  - [ ] Form validation working
  - [ ] Error messages displayed
  - [ ] Successful auth redirects to home

- [ ] **Protected Routes**
  - [ ] Unauthenticated users redirected to login
  - [ ] Authenticated users can access protected pages

### Testing Commands

```bash
# From apps/web directory
npm run dev
# Visit http://localhost:5173

# Test registration
# 1. Navigate to /register
# 2. Fill in form and submit
# 3. Should redirect to home page

# Test login
# 1. Navigate to /login
# 2. Enter credentials
# 3. Should redirect to home page

# Test protected route
# 1. Logout (clear localStorage)
# 2. Navigate to /
# 3. Should redirect to /login
```

---

## 📦 Deliverables

1. ✅ Vite + React + TypeScript configured
2. ✅ Tailwind CSS with design tokens
3. ✅ Zustand stores (auth, cart, UI)
4. ✅ API service layer with interceptors
5. ✅ Login and Register pages
6. ✅ Protected route component
7. ✅ Router configured
8. ✅ Design system integrated

---

## 🔄 Next Session

**Session 7: Frontend - Product Catalog**

Will cover:

- Product listing page with grid
- Product filters and search
- Category navigation
- Product detail page
- Add to cart functionality
- Responsive design

---

## 📚 Reference Documents

- `/DESIGN.md` - Design system
- `/ai-blueprint/capability-definitions.md` - Frontend patterns
- Session 2 - Shared UI components
- Modern Web Guidance skill for View Transitions API

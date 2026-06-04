# System Architecture & Design

## Overview

This document provides a comprehensive overview of the eCommerce platform's architecture, including the system design, data flow, component relationships, and key architectural decisions. This serves as the reference for understanding how all pieces of the system fit together.

---

## 🏗 High-Level Architecture

### Three-Tier Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              React Application (apps/web)                 │   │
│  │                                                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │  Pages   │  │Components│  │  Stores  │  │ Services │ │   │
│  │  │          │  │   (UI)   │  │ (Zustand)│  │  (API)   │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  │                                                            │   │
│  │  Styling: Tailwind CSS + Framer Motion + DESIGN.md       │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            │ JSON Payloads
                            │ JWT Authentication
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                        SERVER TIER                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │           Express Application (apps/api)                  │   │
│  │                                                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │  Routes  │  │Controllers│ │Middleware│  │ Services │ │   │
│  │  │          │  │           │  │          │  │          │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  │                                                            │   │
│  │  Authentication: JWT + bcrypt                             │   │
│  │  Validation: Zod schemas                                  │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Prisma Client
                            │ Type-Safe Queries
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                         DATA TIER                                │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    MySQL Database                         │   │
│  │                                                            │   │
│  │  Tables: users, products, cart_items, orders,            │   │
│  │          order_items                                      │   │
│  │                                                            │   │
│  │  Managed by: Prisma ORM                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Turborepo Monorepo Structure

### Directory Layout

```
ecommerce-platform/
│
├── apps/
│   ├── web/                          # Frontend React application
│   │   ├── src/
│   │   │   ├── pages/                # Route pages
│   │   │   │   ├── Home.tsx
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Register.tsx
│   │   │   │   ├── Products.tsx
│   │   │   │   ├── ProductDetail.tsx
│   │   │   │   ├── Cart.tsx
│   │   │   │   ├── Checkout.tsx
│   │   │   │   └── Account.tsx
│   │   │   │
│   │   │   ├── components/           # UI components
│   │   │   │   ├── layout/
│   │   │   │   │   ├── Header.tsx
│   │   │   │   │   ├── Footer.tsx
│   │   │   │   │   └── Sidebar.tsx
│   │   │   │   ├── product/
│   │   │   │   │   ├── ProductCard.tsx
│   │   │   │   │   ├── ProductGrid.tsx
│   │   │   │   │   └── ProductFilters.tsx
│   │   │   │   ├── cart/
│   │   │   │   │   ├── CartDropdown.tsx
│   │   │   │   │   └── CartItem.tsx
│   │   │   │   └── auth/
│   │   │   │       ├── LoginForm.tsx
│   │   │   │       └── RegisterForm.tsx
│   │   │   │
│   │   │   ├── stores/               # Zustand state stores
│   │   │   │   ├── auth.store.ts
│   │   │   │   ├── cart.store.ts
│   │   │   │   └── ui.store.ts
│   │   │   │
│   │   │   ├── services/             # API service layer
│   │   │   │   ├── api.service.ts    # Axios instance
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── product.service.ts
│   │   │   │   ├── cart.service.ts
│   │   │   │   └── order.service.ts
│   │   │   │
│   │   │   ├── hooks/                # Custom React hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   ├── useCart.ts
│   │   │   │   └── useProducts.ts
│   │   │   │
│   │   │   ├── types/                # App-specific types
│   │   │   ├── utils/                # Utility functions
│   │   │   ├── App.tsx               # Main app component
│   │   │   └── main.tsx              # Entry point
│   │   │
│   │   ├── public/                   # Static assets
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── tailwind.config.js
│   │
│   └── api/                          # Backend Express application
│       ├── src/
│       │   ├── controllers/          # Route controllers
│       │   │   ├── auth.controller.ts
│       │   │   ├── product.controller.ts
│       │   │   ├── cart.controller.ts
│       │   │   ├── order.controller.ts
│       │   │   └── user.controller.ts
│       │   │
│       │   ├── routes/               # API routes
│       │   │   ├── auth.routes.ts
│       │   │   ├── product.routes.ts
│       │   │   ├── cart.routes.ts
│       │   │   ├── order.routes.ts
│       │   │   └── user.routes.ts
│       │   │
│       │   ├── middleware/           # Express middleware
│       │   │   ├── auth.middleware.ts
│       │   │   ├── error.middleware.ts
│       │   │   └── validation.middleware.ts
│       │   │
│       │   ├── services/             # Business logic layer
│       │   │   ├── auth.service.ts
│       │   │   ├── product.service.ts
│       │   │   ├── cart.service.ts
│       │   │   └── order.service.ts
│       │   │
│       │   ├── prisma/               # Prisma ORM
│       │   │   ├── schema.prisma     # Database schema
│       │   │   ├── client.ts         # Prisma singleton
│       │   │   ├── migrations/       # DB migrations
│       │   │   └── seed.ts           # Seed data
│       │   │
│       │   ├── types/                # Type definitions
│       │   ├── utils/                # Utilities & validators
│       │   ├── app.ts                # Express app setup
│       │   └── server.ts             # Server entry point
│       │
│       ├── package.json
│       ├── tsconfig.json
│       └── .env
│
├── packages/
│   ├── ui/                           # Shared UI components
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Button.tsx
│   │       │   ├── Input.tsx
│   │       │   ├── Card.tsx
│   │       │   ├── Modal.tsx
│   │       │   └── index.ts
│   │       └── package.json
│   │
│   ├── types/                        # Shared TypeScript types
│   │   └── src/
│   │       ├── api.ts                # API contracts
│   │       ├── models.ts             # Database models
│   │       ├── common.ts             # Common types
│   │       └── index.ts
│   │
│   ├── config/                       # Shared configurations
│   │   ├── eslint-config/
│   │   ├── typescript-config/
│   │   └── tailwind-config/
│   │
│   └── utils/                        # Shared utilities
│       └── src/
│           ├── validators/
│           ├── formatters/
│           └── index.ts
│
├── DESIGN.md                         # Design system specification
├── ai-blueprint/                     # AI development guidelines
│   ├── engineering-guidelines.md
│   ├── capability-definitions.md
│   ├── initial.md
│   └── architecture.md (this file)
│
├── turborepo.json                    # Turborepo configuration
├── package.json                      # Root package.json
└── README.md
```

---

## 🗄 Database Schema Design

### Entity Relationship Diagram (Text)

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ password_hash   │
│ first_name      │
│ last_name       │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │ 1
         │
         │ has many
         │
         ├──────────────────┬──────────────────┐
         │ *                │ *                │ *
         │                  │                  │
┌────────▼────────┐  ┌─────▼─────────┐  ┌────▼─────────┐
│   CartItem      │  │     Order     │  │              │
├─────────────────┤  ├───────────────┤  │              │
│ id (PK)         │  │ id (PK)       │  │              │
│ user_id (FK)    │  │ user_id (FK)  │  │              │
│ product_id (FK) │  │ status        │  │              │
│ quantity        │  │ total_amount  │  │              │
│ created_at      │  │ shipping_addr │  │              │
└────────┬────────┘  │ created_at    │  │              │
         │           │ updated_at    │  │              │
         │           └────────┬──────┘  │              │
         │                    │         │              │
         │                    │ has many│              │
         │                    │ *       │              │
         │           ┌────────▼─────────▼─┐            │
         │           │    OrderItem       │            │
         │           ├────────────────────┤            │
         │           │ id (PK)            │            │
         │           │ order_id (FK)      │            │
         │           │ product_id (FK)    │            │
         │           │ quantity           │            │
         │           │ price              │            │
         │           └────────┬───────────┘            │
         │                    │                        │
         └────────────────────┴────────────────────────┘
                              │
                              │ belongs to
                              │ 1
                    ┌─────────▼─────────┐
                    │     Product       │
                    ├───────────────────┤
                    │ id (PK)           │
                    │ name              │
                    │ description       │
                    │ price             │
                    │ image_url         │
                    │ category          │
                    │ stock             │
                    │ created_at        │
                    │ updated_at        │
                    └───────────────────┘
```

### Database Relationships

1. **User → CartItem**: One-to-Many (a user has many cart items)
2. **User → Order**: One-to-Many (a user has many orders)
3. **Product → CartItem**: One-to-Many (a product can be in many carts)
4. **Product → OrderItem**: One-to-Many (a product can appear in many orders)
5. **Order → OrderItem**: One-to-Many (an order has many items)

### Key Indexes

- `users.email` - UNIQUE index for fast lookup and constraint
- `products.category` - Index for category filtering
- `orders.user_id` - Index for user order history queries
- `cart_items.(user_id, product_id)` - UNIQUE composite index

---

## 🔐 Authentication Flow

### JWT Token Architecture

```
┌─────────────┐                                    ┌─────────────┐
│   Client    │                                    │   Server    │
│  (Browser)  │                                    │   (API)     │
└──────┬──────┘                                    └──────┬──────┘
       │                                                  │
       │  1. POST /api/auth/login                        │
       │     { email, password }                         │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │                                     2. Validate credentials
       │                                        Hash comparison (bcrypt)
       │                                                  │
       │  3. Return tokens                               │
       │     { accessToken, refreshToken, user }         │
       │<────────────────────────────────────────────────┤
       │                                                  │
   4. Store tokens                                       │
      - accessToken in memory                            │
      - refreshToken in localStorage (Zustand persist)   │
       │                                                  │
       │  5. Subsequent API calls                        │
       │     Authorization: Bearer {accessToken}         │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │                                     6. Verify token (JWT)
       │                                                  │
       │  7. Protected resource                          │
       │<────────────────────────────────────────────────┤
       │                                                  │
       │                                                  │
   [Access token expired]                                │
       │                                                  │
       │  8. Request with expired token                  │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │  9. 401 Unauthorized                            │
       │<────────────────────────────────────────────────┤
       │                                                  │
  10. Intercept 401                                      │
      Axios interceptor                                  │
       │                                                  │
       │  11. POST /api/auth/refresh                     │
       │      { refreshToken }                           │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │                                    12. Verify refresh token
       │                                        Generate new access token
       │                                                  │
       │  13. New accessToken                            │
       │<────────────────────────────────────────────────┤
       │                                                  │
  14. Update stored token                                │
      Retry original request                             │
       │                                                  │
       │  15. Retry original request                     │
       │     Authorization: Bearer {newAccessToken}      │
       ├────────────────────────────────────────────────>│
       │                                                  │
       │  16. Success response                           │
       │<────────────────────────────────────────────────┤
       │                                                  │
```

### Token Specifications

- **Access Token**:
  - Lifetime: 15 minutes
  - Storage: Memory (React state/store)
  - Purpose: Short-lived authentication for API requests
- **Refresh Token**:
  - Lifetime: 7 days
  - Storage: localStorage via Zustand persist
  - Purpose: Obtain new access tokens without re-login

---

## 🔄 Data Flow Patterns

### Example: Adding Product to Cart

```
User clicks "Add to Cart"
         │
         ▼
┌────────────────────────┐
│   ProductCard.tsx      │ Component triggers action
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   useCartStore         │ Call addItem()
│   (Zustand)            │ Update client-side state
└───────────┬────────────┘
            │
            ├──> 1. Optimistic UI update (item appears in cart)
            │
            ▼
┌────────────────────────┐
│   cart.service.ts      │ API service call
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   POST /api/cart/items │ HTTP request with JWT
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   auth.middleware.ts   │ Verify JWT token
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   cart.controller.ts   │ Route handler
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   cart.service.ts      │ Business logic
│   (Backend)            │
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   Prisma Client        │ Database operation
│   prisma.cartItem.create()
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   MySQL Database       │ Persist cart item
└───────────┬────────────┘
            │
            ▼ (Response bubbles back up)
┌────────────────────────┐
│   Success Response     │ { success: true, data: cartItem }
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   useCartStore         │ Confirm/sync state with server
└───────────┬────────────┘
            │
            ▼
┌────────────────────────┐
│   UI Updates           │ Cart badge shows new count
│                        │ CartDropdown shows new item
└────────────────────────┘
```

---

## 🎨 Component Hierarchy

### Frontend Component Tree

```
App.tsx
│
├── Router
│   │
│   ├── Layout
│   │   ├── Header
│   │   │   ├── Logo
│   │   │   ├── Navigation
│   │   │   ├── SearchBar
│   │   │   ├── CartBadge (shows count from useCartStore)
│   │   │   └── UserMenu (shows user from useAuthStore)
│   │   │
│   │   ├── Main (outlet for routes)
│   │   │
│   │   └── Footer
│   │
│   └── Routes
│       │
│       ├── Home (/)
│       │   ├── Hero
│       │   ├── FeaturedProducts
│       │   └── Categories
│       │
│       ├── Products (/products)
│       │   ├── ProductFilters
│       │   ├── ProductSearch
│       │   ├── ProductSort
│       │   └── ProductGrid
│       │       └── ProductCard (multiple)
│       │
│       ├── ProductDetail (/products/:id)
│       │   ├── ProductImages
│       │   ├── ProductInfo
│       │   └── AddToCartButton
│       │
│       ├── Cart (/cart)
│       │   ├── CartItemList
│       │   │   └── CartItem (multiple)
│       │   └── CartSummary
│       │
│       ├── Checkout (/checkout)
│       │   ├── CheckoutSteps
│       │   ├── StepContent (conditional)
│       │   │   ├── ReviewCart
│       │   │   ├── ShippingForm
│       │   │   └── PaymentForm
│       │   └── OrderSummary
│       │
│       ├── Account (/account) [Protected]
│       │   ├── AccountNav
│       │   └── Outlet
│       │       ├── Profile (/account/profile)
│       │       └── Orders (/account/orders)
│       │           └── OrderCard (multiple)
│       │
│       ├── Login (/login)
│       │   └── LoginForm
│       │
│       └── Register (/register)
│           └── RegisterForm
│
├── Global Components (rendered by stores)
│   ├── CartDropdown (controlled by useUIStore)
│   ├── NotificationToast (controlled by useUIStore)
│   └── LoadingOverlay (conditional)
│
└── Providers
    ├── ErrorBoundary
    └── ThemeProvider (if needed)
```

---

## 🏪 State Management Architecture

### Zustand Store Organization

```
┌─────────────────────────────────────────────────────────────┐
│                      Global State (Zustand)                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────┐  │
│  │  useAuthStore    │  │  useCartStore    │  │ useUIStore│  │
│  ├──────────────────┤  ├──────────────────┤  ├───────────┤  │
│  │ - user           │  │ - items[]        │  │ - modals  │  │
│  │ - accessToken    │  │ - addItem()      │  │ - toasts  │  │
│  │ - refreshToken   │  │ - removeItem()   │  │ - loading │  │
│  │ - isAuth         │  │ - updateQty()    │  │           │  │
│  │                  │  │ - clearCart()    │  │           │  │
│  │ - setTokens()    │  │ - getTotal()     │  │           │  │
│  │ - setUser()      │  │                  │  │           │  │
│  │ - logout()       │  │ Persisted:       │  │           │  │
│  │                  │  │ localStorage     │  │           │  │
│  │ Persisted:       │  └──────────────────┘  └───────────┘  │
│  │ localStorage     │                                        │
│  │ (refreshToken)   │                                        │
│  └──────────────────┘                                        │
│                                                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Used by
                              ▼
                    ┌──────────────────────┐
                    │   React Components   │
                    │                      │
                    │  - Subscribe to      │
                    │    specific state    │
                    │  - Call actions      │
                    │  - Auto re-render    │
                    └──────────────────────┘
```

### State Persistence Strategy

- **Auth Store**: Persist `refreshToken` only (security)
- **Cart Store**: Persist entire cart state (UX)
- **UI Store**: No persistence (transient state)

---

## 🚀 API Architecture

### API Route Organization

```
/api
├── /auth
│   ├── POST   /register       → auth.controller.register()
│   ├── POST   /login          → auth.controller.login()
│   ├── POST   /refresh        → auth.controller.refresh()
│   ├── POST   /logout         → auth.controller.logout()
│   └── GET    /me             → auth.controller.getCurrentUser() [Protected]
│
├── /products
│   ├── GET    /               → product.controller.list()
│   ├── GET    /:id            → product.controller.getById()
│   ├── POST   /               → product.controller.create() [Admin]
│   ├── PUT    /:id            → product.controller.update() [Admin]
│   └── DELETE /:id            → product.controller.delete() [Admin]
│
├── /cart
│   ├── GET    /               → cart.controller.getCart() [Protected]
│   ├── POST   /items          → cart.controller.addItem() [Protected]
│   ├── PUT    /items/:id      → cart.controller.updateQuantity() [Protected]
│   ├── DELETE /items/:id      → cart.controller.removeItem() [Protected]
│   └── DELETE /               → cart.controller.clearCart() [Protected]
│
├── /orders
│   ├── GET    /               → order.controller.list() [Protected]
│   ├── GET    /:id            → order.controller.getById() [Protected]
│   └── POST   /               → order.controller.create() [Protected]
│
└── /users
    ├── GET    /profile        → user.controller.getProfile() [Protected]
    └── PUT    /profile        → user.controller.updateProfile() [Protected]
```

### Middleware Chain

```
Incoming Request
      │
      ▼
┌─────────────────┐
│  CORS Middleware│ Allow frontend origin
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Helmet (Security)│ Set security headers
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Body Parser     │ Parse JSON
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Route Handler   │ Match route
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Auth Middleware │ Verify JWT (if protected)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Validation      │ Zod schema validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Controller    │ Business logic
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Service      │ Data access via Prisma
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    Response     │ JSON response
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Error Handler   │ Catch and format errors
└─────────────────┘
```

---

## 🎯 Key Architectural Decisions

### 1. Monorepo with Turborepo

**Why**: Code sharing, unified tooling, efficient builds
**Trade-off**: Initial complexity, but scales well

### 2. TypeScript Everywhere

**Why**: Type safety, better DX, fewer runtime errors
**Trade-off**: Slightly more verbose, but catches bugs early

### 3. Prisma ORM

**Why**: Type-safe database access, migrations, excellent DX
**Trade-off**: Learning curve, but worth it for type safety

### 4. Zustand for State

**Why**: Lightweight, simple API, built-in persistence
**Trade-off**: Less ecosystem than Redux, but sufficient for this app

### 5. JWT Authentication

**Why**: Stateless, scalable, works well with SPAs
**Trade-off**: Token management complexity, but standard approach

### 6. Tailwind CSS

**Why**: Utility-first, rapid development, consistent design
**Trade-off**: HTML can look verbose, but fast iteration

### 7. Vite for Frontend

**Why**: Fast HMR, modern tooling, excellent DX
**Trade-off**: Newer than Webpack, but mature enough

---

## 🔒 Security Considerations

1. **Password Storage**: bcrypt with 12 salt rounds
2. **JWT Secrets**: Strong, environment-specific secrets
3. **CORS**: Restricted to frontend origin
4. **Input Validation**: Zod schemas on all endpoints
5. **SQL Injection**: Prevented by Prisma (parameterized queries)
6. **XSS Protection**: Helmet middleware, sanitized inputs
7. **Rate Limiting**: On authentication endpoints
8. **HTTPS Only**: In production

---

## 📈 Scalability Considerations

### Current Architecture

- Monolithic frontend + backend
- Single MySQL database
- Suitable for: 1K-100K users

### Future Scaling Path

1. **Horizontal Scaling**: Load balance multiple API instances
2. **Database Optimization**: Read replicas, connection pooling
3. **Caching Layer**: Redis for sessions, product catalog
4. **CDN**: Static assets and images
5. **Microservices**: Split into auth, products, orders services
6. **Message Queue**: For async operations (email, analytics)

---

## 🧪 Testing Strategy

### Frontend Testing Pyramid

```
        ┌────────┐
        │   E2E  │ (Few) - Full user journeys
        └───┬────┘
      ┌─────▼─────┐
      │Integration│ (Some) - Feature flows
      └─────┬─────┘
    ┌───────▼───────┐
    │  Unit Tests   │ (Many) - Components, hooks
    └───────────────┘
```

### Backend Testing Pyramid

```
        ┌────────┐
        │   E2E  │ (Few) - Full API flows
        └───┬────┘
      ┌─────▼─────┐
      │Integration│ (Some) - API endpoints
      └─────┬─────┘
    ┌───────▼───────┐
    │  Unit Tests   │ (Many) - Services, utils
    └───────────────┘
```

---

## 🎨 Design System Integration

All UI components reference `/DESIGN.md`:

- Colors via Tailwind config
- Typography via font imports and Tailwind
- Spacing via Tailwind scale
- Animations via Framer Motion

Modern web features via **modern-web-guidance skill**:

- View Transitions
- Scroll animations
- Container queries
- Performance optimizations

---

## 📊 Performance Metrics

### Target Metrics

- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.5s
- **Cumulative Layout Shift (CLS)**: < 0.1

### Optimization Strategies

- Code splitting (React.lazy)
- Image lazy loading
- Gzip/Brotli compression
- Tree shaking
- Bundle size monitoring

---

## 🤝 Development Guidelines

Refer to:

- `/ai-blueprint/engineering-guidelines.md` - Coding standards
- `/ai-blueprint/capability-definitions.md` - Reusable patterns
- `/ai-blueprint/initial.md` - Implementation guide
- `/DESIGN.md` - Visual specifications

---

## Summary

This architecture provides a **solid foundation** for:

- ✅ Scalable full-stack development
- ✅ Type-safe code across the stack
- ✅ Modern development experience
- ✅ Production-ready security and performance
- ✅ Clear separation of concerns
- ✅ Easy team collaboration via monorepo

The system is designed to be **maintainable, testable, and extensible** while delivering a **premium user experience**.

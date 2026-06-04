# Initial Bootstrap Prompt: eCommerce Platform

## 🎯 Project Overview

You are tasked with building a **premium, production-grade eCommerce platform** from scratch. This is not a simple demo—it must be a fully functional, visually stunning, and professionally architected application that could be deployed to production and maintained by engineering teams.

### Core Objectives

1. **Premium UI/UX**: Create a modern, polished interface that feels professional and trustworthy
2. **Full-Stack Type Safety**: Leverage TypeScript throughout for type-safe development
3. **Scalable Architecture**: Build with monorepo structure for team collaboration
4. **Modern Web Standards**: Use cutting-edge web APIs and best practices
5. **Production-Ready**: Include error handling, testing, security, and performance optimizations

---

## 📋 Mandatory References

**BEFORE STARTING ANY WORK**, you must:

1. **Read `/DESIGN.md`** - All visual styling MUST follow the design system specified:
   - Primary color: `#FECE14` (Yellow)
   - Secondary color: `#000000` (Black)
   - Typography: Poppins (primary), IBM Plex Mono (code/labels)
   - Spacing scale: 4/8/12/16/24/32 pixels
   - Border radius: 4px (sm), 8px (md)

2. **Execute `modern-web-guidance` skill** - Use modern web APIs for:
   - View Transitions API for smooth page transitions
   - Scroll-driven animations for engaging interactions
   - Container queries for responsive components
   - Modern CSS features (`:has()`, `content-visibility`)
   - Performance optimizations

3. **Review `/ai-blueprint/engineering-guidelines.md`** - Follow ALL conventions:
   - TypeScript strict mode
   - Naming conventions (camelCase, PascalCase, kebab-case)
   - Code organization and structure
   - Error handling patterns
   - Testing requirements

4. **Review `/ai-blueprint/capability-definitions.md`** - Leverage reusable patterns:
   - JWT authentication flow
   - Prisma database patterns
   - Zustand state management
   - UI component library
   - API design patterns

5. **Review `/ai-blueprint/architecture.md`** - Understand system design:
   - Turborepo monorepo structure
   - Database schema
   - Authentication flow
   - Component hierarchy

---

## 🛠 Tech Stack Specification

### Frontend

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite (fast, modern bundler)
- **Routing**: React Router v6
- **State Management**: Zustand with persist middleware
- **Styling**: Tailwind CSS (configured with design tokens from DESIGN.md)
- **Animations**: Framer Motion (for premium micro-interactions)
- **HTTP Client**: Axios (with interceptors for auth)
- **Form Handling**: React Hook Form + Zod validation
- **Testing**: Jest + React Testing Library

### Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express with TypeScript
- **Database**: MySQL
- **ORM**: Prisma (type-safe database access)
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Zod (runtime type validation)
- **Security**: helmet, cors, bcrypt
- **Testing**: Jest + Supertest

### Monorepo Management

- **Tool**: Turborepo
- **Package Manager**: npm workspaces
- **Structure**:
  - `apps/web` - React frontend
  - `apps/api` - Express backend
  - `packages/ui` - Shared UI components
  - `packages/types` - Shared TypeScript types
  - `packages/config` - Shared configurations
  - `packages/utils` - Shared utilities

---

## 🎨 Visual Design Requirements

### Premium "Professional" Theme

The application MUST embody a **polished, business-ready aesthetic**:

1. **Color Scheme** (from DESIGN.md):
   - Primary actions: Yellow (#FECE14) - used for CTAs, highlights
   - Text and headers: Black (#000000) - strong contrast
   - Success: Green (#16A34A)
   - Warning: Orange (#D97706)
   - Danger: Red (#DC2626)
   - Background: White (#FFFFFF)

2. **Typography**:
   - Headings: Poppins (600-700 weight)
   - Body: Poppins (400 weight)
   - Labels/Code: IBM Plex Mono (400 weight, uppercase for labels)
   - Import fonts from Google Fonts

3. **Spacing & Layout**:
   - Use consistent spacing scale: 4, 8, 12, 16, 24, 32 pixels
   - Generous whitespace for breathing room
   - Mobile-first responsive design
   - Max content width: 1280px

4. **UI Polish**:
   - Smooth animations and transitions (Framer Motion)
   - Hover states on all interactive elements
   - Loading states with spinners/skeletons
   - Micro-interactions (button press, card hover)
   - Subtle shadows for depth
   - Border radius: 4-8px for modern feel

5. **Imagery**:
   - Use placeholder images (via Unsplash or similar)
   - Lazy load images for performance
   - WebP format when possible
   - Proper aspect ratios (e.g., 4:3 for products)

---

## 🏗 Core Features Breakdown

### 1. Authentication System

#### Requirements

- User registration with email/password
- User login with JWT tokens
- Access token (15min) + Refresh token (7d) rotation
- Protected routes (frontend and backend)
- Password hashing with bcrypt (12 salt rounds)
- "Remember me" functionality via refresh token persistence

#### Pages/Components

- `/login` - Login page
- `/register` - Registration page
- Auth forms with validation (email format, min 8 chars password)
- Error messages for invalid credentials
- Loading states during authentication

#### API Endpoints

- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Invalidate tokens
- `GET /api/auth/me` - Get current user (protected)

#### Acceptance Criteria

✅ User can register with valid email/password
✅ User can login and receive JWT tokens
✅ Tokens are automatically refreshed when expired
✅ User stays logged in after page refresh (if tokens valid)
✅ Protected pages redirect to login when not authenticated
✅ Logout clears all tokens and redirects to home

---

### 2. Product Catalog

#### Requirements

- Display grid of products with images, names, prices
- Search functionality (by name/description)
- Filter by category
- Sort by price (low-high, high-low), newest
- Pagination or infinite scroll
- Product detail view with larger image, full description
- Stock availability display
- "Add to Cart" functionality

#### Pages/Components

- `/products` - Product listing page
- `/products/:id` - Product detail page
- `ProductGrid` - Grid layout component
- `ProductCard` - Individual product card
- `ProductFilters` - Filter sidebar/dropdown
- `ProductSearch` - Search bar component

#### API Endpoints

- `GET /api/products` - List products (with query params: category, search, sort, page, limit)
- `GET /api/products/:id` - Get single product details

#### Database Schema (Prisma)

```prisma
model Product {
  id          String   @id @default(uuid())
  name        String
  description String   @db.Text
  price       Decimal  @db.Decimal(10, 2)
  image_url   String
  category    String
  stock       Int      @default(0)
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
}
```

#### Acceptance Criteria

✅ Products display in responsive grid (4 cols desktop, 2 tablet, 1 mobile)
✅ Product cards show image, name, price, "Add to Cart" button
✅ Search returns filtered results in real-time
✅ Category filtering works correctly
✅ Product detail page shows full information
✅ Out-of-stock products show unavailable state
✅ Adding to cart updates cart badge count

---

### 3. Shopping Cart & Checkout

#### Requirements

- Persistent cart (survives page refresh via Zustand persist)
- Add/remove items from cart
- Update quantities
- Display subtotal, tax, shipping (if applicable), total
- Cart preview dropdown from navbar
- Full cart page
- Multi-step checkout process:
  1. Review cart items
  2. Shipping information
  3. Payment information (mock for now)
  4. Order confirmation

#### Pages/Components

- `/cart` - Full cart page
- `/checkout` - Multi-step checkout
- `CartDropdown` - Preview cart in navbar (opens as modal/dropdown)
- `CartItem` - Individual cart item row
- `CheckoutSteps` - Step indicator
- `ShippingForm` - Address input form
- `PaymentForm` - Payment details (mock)
- `OrderSummary` - Final order summary

#### State Management (Zustand)

```typescript
interface CartState {
  items: CartItem[];
  addItem: (item) => void;
  removeItem: (productId) => void;
  updateQuantity: (productId, quantity) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}
```

#### API Endpoints

- `GET /api/cart` - Get user's cart (for logged-in users)
- `POST /api/cart/items` - Add item to cart
- `PUT /api/cart/items/:id` - Update quantity
- `DELETE /api/cart/items/:id` - Remove item
- `DELETE /api/cart` - Clear cart
- `POST /api/orders` - Create order from cart

#### Database Schema

```prisma
model CartItem {
  id         String   @id @default(uuid())
  user_id    String
  product_id String
  quantity   Int
  user       User     @relation(fields: [user_id], references: [id])
  product    Product  @relation(fields: [product_id], references: [id])
}

model Order {
  id               String      @id @default(uuid())
  user_id          String
  status           OrderStatus
  total_amount     Decimal
  shipping_address String
  created_at       DateTime    @default(now())
  order_items      OrderItem[]
}
```

#### Acceptance Criteria

✅ Cart persists across page refreshes
✅ User can add/remove items and update quantities
✅ Cart displays accurate totals
✅ Cart badge shows item count in navbar
✅ Checkout validates all required fields
✅ Order is created successfully in database
✅ Cart is cleared after successful order
✅ User receives order confirmation

---

### 4. User Account Section

#### Requirements

- Profile management (view/edit name, email)
- Order history with status
- Order details view
- Password change functionality (optional)
- Logout button

#### Pages/Components

- `/account` - Account dashboard
- `/account/profile` - Profile settings
- `/account/orders` - Order history list
- `/account/orders/:id` - Single order details
- `OrderCard` - Order summary card
- `OrderStatusBadge` - Visual status indicator
- `ProfileForm` - Edit profile form

#### API Endpoints

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/orders` - Get user's order history
- `GET /api/orders/:id` - Get specific order details

#### Acceptance Criteria

✅ User can view their profile information
✅ User can edit name and email
✅ Order history displays all past orders
✅ Each order shows date, total, status
✅ Order details show all items purchased
✅ Status badges have appropriate colors (pending, shipped, delivered)

---

## 🏛 Technical Implementation Details

### Turborepo Configuration

Create a `turborepo.json` at root:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "type-check": {
      "dependsOn": ["^build"],
      "outputs": []
    }
  }
}
```

### Root package.json Scripts

```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check"
  }
}
```

### Environment Variables

#### Frontend (`apps/web/.env.local`)

```bash
VITE_API_URL=http://localhost:3001/api
```

#### Backend (`apps/api/.env`)

```bash
DATABASE_URL="mysql://root:password@localhost:3306/ecommerce"
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
```

### Database Setup

1. **Create MySQL database**: `CREATE DATABASE ecommerce;`
2. **Initialize Prisma**:
   ```bash
   cd apps/api
   npx prisma migrate dev --name init
   npx prisma generate
   ```
3. **Seed database** (optional):
   - Create `prisma/seed.ts` with sample products and test user
   - Run: `npx prisma db seed`

### Prisma Complete Schema

Located at `apps/api/src/prisma/schema.prisma`:

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String     @id @default(uuid())
  email         String     @unique
  password_hash String
  first_name    String
  last_name     String
  created_at    DateTime   @default(now())
  updated_at    DateTime   @updatedAt
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
  id               String      @id @default(uuid())
  user_id          String
  status           OrderStatus @default(PENDING)
  total_amount     Decimal     @db.Decimal(10, 2)
  shipping_address String      @db.Text
  created_at       DateTime    @default(now())
  updated_at       DateTime    @updatedAt
  user             User        @relation(fields: [user_id], references: [id])
  order_items      OrderItem[]

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

---

## 🧪 Testing Requirements

### Frontend Tests

- **Component Tests**: All UI components must have basic rendering tests
- **Integration Tests**: Test user flows (login, add to cart, checkout)
- **Minimum Coverage**: 70% for components

Example:

```typescript
describe('ProductCard', () => {
  it('renders product information', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
  });

  it('calls addToCart when button clicked', () => {
    const mockAddToCart = jest.fn();
    render(<ProductCard product={mockProduct} onAddToCart={mockAddToCart} />);
    fireEvent.click(screen.getByText('Add to Cart'));
    expect(mockAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
```

### Backend Tests

- **API Endpoint Tests**: Test all routes with success and error cases
- **Authentication Tests**: Verify JWT flow and protected routes
- **Minimum Coverage**: 80% for business logic

Example:

```typescript
describe("POST /api/auth/login", () => {
  it("returns token for valid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "password123" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
  });

  it("returns 401 for invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@example.com", password: "wrongpassword" });

    expect(response.status).toBe(401);
  });
});
```

---

## 🚀 Development Workflow

### Initial Setup

```bash
# Clone/create project directory
mkdir ecommerce-platform && cd ecommerce-platform

# Initialize Turborepo project
npx create-turbo@latest

# Install dependencies
npm install

# Set up environment variables
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env

# Set up database
cd apps/api
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed

# Return to root and start dev servers
cd ../..
npm run dev
```

### Running the Application

```bash
# Start all apps in development mode
npm run dev
# Frontend: http://localhost:5173
# Backend: http://localhost:3001

# Run tests
npm run test

# Type check all packages
npm run type-check

# Build for production
npm run build
```

---

## 📦 Key Dependencies

### Frontend (`apps/web/package.json`)

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "zustand": "^4.4.7",
    "axios": "^1.6.2",
    "framer-motion": "^10.16.16",
    "react-hook-form": "^7.49.2",
    "zod": "^3.22.4",
    "@repo/ui": "workspace:*",
    "@repo/types": "workspace:*"
  },
  "devDependencies": {
    "@types/react": "^18.2.45",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "@testing-library/react": "^14.1.2",
    "@testing-library/jest-dom": "^6.1.5",
    "jest": "^29.7.0"
  }
}
```

### Backend (`apps/api/package.json`)

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "@prisma/client": "^5.7.1",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "@repo/types": "workspace:*"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3",
    "ts-node-dev": "^2.0.0",
    "prisma": "^5.7.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2"
  }
}
```

---

## 🎯 Success Criteria

Your implementation will be considered **production-grade** if:

### Functionality

✅ All core features work end-to-end without errors
✅ Authentication flow is secure and smooth
✅ Products can be browsed, searched, and filtered
✅ Cart persists and checkout process completes successfully
✅ Order history displays correctly in account section

### Code Quality

✅ TypeScript strict mode with no `any` types
✅ Follows naming conventions from engineering guidelines
✅ Proper error handling throughout (try-catch, error boundaries)
✅ Reusable components and functions (DRY principle)
✅ Code is well-organized and documented

### Design & UX

✅ Matches DESIGN.md specifications exactly
✅ Responsive on mobile, tablet, and desktop
✅ Smooth animations and transitions
✅ Loading states for async operations
✅ Error messages are user-friendly
✅ Overall "premium" feel with polish

### Performance

✅ Frontend bundle size < 250KB gzipped
✅ API responses < 200ms for simple queries
✅ Images are lazy loaded and optimized
✅ No console errors or warnings

### Testing

✅ Frontend component tests pass
✅ Backend API tests pass
✅ Core user flows are tested

---

## 🎬 Getting Started

Now that you have this comprehensive blueprint, follow this sequence:

1. **Initialize Turborepo structure** with apps/ and packages/ directories
2. **Set up Prisma** with the database schema
3. **Build backend API** with authentication and all endpoints
4. **Create shared types package** for API contracts
5. **Build UI component library** following DESIGN.md
6. **Implement frontend pages** and connect to API
7. **Add Zustand stores** for state management
8. **Implement animations** with Framer Motion
9. **Write tests** for critical paths
10. **Polish UI/UX** and optimize performance

**Remember**: Continuously reference DESIGN.md, engineering-guidelines.md, capability-definitions.md, and architecture.md throughout development.

---

## 🤝 Final Notes

This is an **AI-driven development project**. The quality of the output depends on:

1. **Strict adherence** to engineering guidelines
2. **Creative implementation** of design specifications
3. **Thoughtful architecture** for maintainability
4. **Production-ready mindset** (security, performance, testing)

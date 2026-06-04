# Session 1: Project Foundation & Database Setup

## 🎯 Session Objectives

Establish the foundational structure of the eCommerce platform including:

- Turborepo monorepo architecture
- MySQL database setup
- Prisma ORM configuration with complete schema
- Database migrations and seed data
- Project scaffolding for all workspaces

**Duration Estimate:** 1-2 hours  
**Dependencies:** None (first session)

---

## 📋 Required Context

Before starting, review these documents:

1. **`/ai-blueprint/architecture.md`** - Understanding the monorepo structure and database schema
2. **`/ai-blueprint/engineering-guidelines.md`** - TypeScript configuration, naming conventions
3. **`/ai-blueprint/initial.md`** - Technical specifications for Turborepo and Prisma

---

## 🏗 Implementation Steps

### Step 1: Initialize Turborepo Monorepo

```bash
# Create project directory
mkdir ecommerce-platform && cd ecommerce-platform

# Initialize Turborepo
npx create-turbo@latest --skip-install

# Follow prompts to set up basic structure
```

**Expected Structure:**

```
ecommerce-platform/
├── apps/
├── packages/
├── turbo.json
├── package.json
└── .gitignore
```

### Step 2: Configure Root Package.json

Create/update `package.json`:

```json
{
  "name": "ecommerce-platform",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### Step 3: Configure Turborepo Pipeline

Create/update `turbo.json`:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
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
    },
    "clean": {
      "cache": false
    }
  }
}
```

### Step 4: Create Workspace Directories

```bash
# Create app workspaces
mkdir -p apps/web apps/api

# Create package workspaces
mkdir -p packages/ui packages/types packages/config packages/utils

# Create subdirectories for packages
mkdir -p packages/config/eslint-config
mkdir -p packages/config/typescript-config
mkdir -p packages/config/tailwind-config
```

### Step 5: Set Up Backend (apps/api)

#### 5.1 Initialize Backend Package

Create `apps/api/package.json`:

```json
{
  "name": "@repo/api",
  "version": "1.0.0",
  "private": true,
  "main": "dist/server.js",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "jest",
    "type-check": "tsc --noEmit",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "ts-node src/prisma/seed.ts",
    "clean": "rm -rf dist"
  },
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
    "@types/cors": "^2.8.17",
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3",
    "ts-node": "^10.9.2",
    "ts-node-dev": "^2.0.0",
    "prisma": "^5.7.1",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "@types/supertest": "^6.0.2",
    "@types/jest": "^29.5.11"
  }
}
```

#### 5.2 Create Backend Directory Structure

```bash
cd apps/api
mkdir -p src/{controllers,routes,middleware,services,prisma,types,utils}
```

#### 5.3 Configure TypeScript

Create `apps/api/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### Step 6: Set Up Prisma with MySQL

#### 6.1 Create Prisma Schema

Create `apps/api/src/prisma/schema.prisma`:

```prisma
// This is your Prisma schema file

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
  output   = "../node_modules/.prisma/client"
}

// User model
model User {
  id            String     @id @default(uuid())
  email         String     @unique
  password_hash String
  first_name    String
  last_name     String
  created_at    DateTime   @default(now())
  updated_at    DateTime   @updatedAt

  // Relations
  orders        Order[]
  cart_items    CartItem[]

  @@map("users")
}

// Product model
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

  // Relations
  cart_items  CartItem[]
  order_items OrderItem[]

  @@index([category])
  @@map("products")
}

// CartItem model
model CartItem {
  id         String   @id @default(uuid())
  user_id    String
  product_id String
  quantity   Int      @default(1)
  created_at DateTime @default(now())

  // Relations
  user       User     @relation(fields: [user_id], references: [id], onDelete: Cascade)
  product    Product  @relation(fields: [product_id], references: [id])

  @@unique([user_id, product_id])
  @@map("cart_items")
}

// Order model
model Order {
  id               String      @id @default(uuid())
  user_id          String
  status           OrderStatus @default(PENDING)
  total_amount     Decimal     @db.Decimal(10, 2)
  shipping_address String      @db.Text
  created_at       DateTime    @default(now())
  updated_at       DateTime    @updatedAt

  // Relations
  user             User        @relation(fields: [user_id], references: [id])
  order_items      OrderItem[]

  @@index([user_id])
  @@map("orders")
}

// OrderItem model
model OrderItem {
  id         String  @id @default(uuid())
  order_id   String
  product_id String
  quantity   Int
  price      Decimal @db.Decimal(10, 2)

  // Relations
  order      Order   @relation(fields: [order_id], references: [id], onDelete: Cascade)
  product    Product @relation(fields: [product_id], references: [id])

  @@map("order_items")
}

// OrderStatus enum
enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}
```

#### 6.2 Create Prisma Client Singleton

Create `apps/api/src/prisma/client.ts`:

```typescript
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

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

#### 6.3 Create Database Seed File

Create `apps/api/src/prisma/seed.ts`:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create test user
  const hashedPassword = await bcrypt.hash("password123", 12);
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      password_hash: hashedPassword,
      first_name: "Test",
      last_name: "User",
    },
  });
  console.log("Created test user:", user.email);

  // Create sample products
  const products = [
    {
      name: "Wireless Headphones",
      description: "High-quality wireless headphones with noise cancellation",
      price: 199.99,
      image_url:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
      category: "Electronics",
      stock: 50,
    },
    {
      name: "Smart Watch",
      description: "Fitness tracking and notifications on your wrist",
      price: 299.99,
      image_url:
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
      category: "Electronics",
      stock: 30,
    },
    {
      name: "Laptop Backpack",
      description: "Durable backpack with laptop compartment",
      price: 79.99,
      image_url:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
      category: "Accessories",
      stock: 100,
    },
    {
      name: "Coffee Maker",
      description: "Programmable coffee maker with thermal carafe",
      price: 89.99,
      image_url:
        "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800",
      category: "Home",
      stock: 25,
    },
    {
      name: "Running Shoes",
      description: "Comfortable running shoes with advanced cushioning",
      price: 129.99,
      image_url:
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
      category: "Sports",
      stock: 75,
    },
    {
      name: "Yoga Mat",
      description: "Non-slip yoga mat with carrying strap",
      price: 39.99,
      image_url:
        "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800",
      category: "Sports",
      stock: 150,
    },
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }
  console.log(`Created ${products.length} products`);
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

#### 6.4 Add Prisma Seed Configuration

Update `apps/api/package.json` to add:

```json
{
  "prisma": {
    "seed": "ts-node src/prisma/seed.ts"
  }
}
```

#### 6.5 Create Environment Variables Template

Create `apps/api/.env.example`:

```bash
# Database
DATABASE_URL="mysql://root:password@localhost:3306/ecommerce"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-token-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d

# Server
PORT=3001
NODE_ENV=development

# CORS
FRONTEND_URL=http://localhost:5173
```

Create `apps/api/.env`:

```bash
DATABASE_URL="mysql://root:password@localhost:3306/ecommerce"
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=dev-refresh-secret-change-in-production
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Add to `apps/api/.gitignore`:

```
node_modules
dist
.env
.env.local
coverage
*.log
```

### Step 7: Initialize Database

```bash
cd apps/api

# Install dependencies
npm install

# Create MySQL database (run in MySQL CLI)
# CREATE DATABASE ecommerce;

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

### Step 8: Create Basic Server Entry Point

Create `apps/api/src/server.ts`:

```typescript
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Placeholder for API routes
app.get("/api", (req, res) => {
  res.json({ message: "eCommerce API - Ready for implementation" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
```

### Step 9: Root Configuration Files

Create `.gitignore` in root:

```
node_modules
dist
build
.env
.env.local
.env.*.local
*.log
coverage
.DS_Store
.turbo
```

Create `README.md` in root:

```markdown
# eCommerce Platform

Premium, production-grade eCommerce platform built with React, Node.js, and MySQL.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Zustand
- **Backend:** Node.js, Express, Prisma, MySQL
- **Monorepo:** Turborepo

## Getting Started

### Prerequisites

- Node.js >= 18
- MySQL >= 8
- npm >= 9

### Installation

1. Clone repository
2. Install dependencies: `npm install`
3. Set up database: `CREATE DATABASE ecommerce;`
4. Configure environment: Copy `apps/api/.env.example` to `apps/api/.env`
5. Run migrations: `cd apps/api && npx prisma migrate dev`
6. Seed database: `cd apps/api && npx prisma db seed`
7. Start development: `npm run dev`

## Development

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `npm run type-check` - Type check

## Project Structure
```

ecommerce-platform/
├── apps/
│ ├── web/ # React frontend
│ └── api/ # Express backend
├── packages/
│ ├── ui/ # Shared UI components
│ ├── types/ # Shared TypeScript types
│ ├── config/ # Shared configurations
│ └── utils/ # Shared utilities
└── turbo.json # Turborepo configuration

```

## Session Implementation

This project follows a phased implementation approach:
- Session 1: Foundation & Database (current)
- Session 2: Shared Packages
- Session 3-5: Backend Implementation
- Session 6-9: Frontend Implementation
- Session 10: Testing & QA
```

---

## ✅ Quality Assessment Criteria

### Verification Checklist

Before moving to the next session, verify:

- [ ] **Turborepo Structure**
  - [ ] Root `package.json` configured with workspaces
  - [ ] `turbo.json` configured with proper pipeline
  - [ ] All workspace directories created (`apps/`, `packages/`)

- [ ] **Backend Foundation**
  - [ ] `apps/api/package.json` with all dependencies
  - [ ] TypeScript configuration (`tsconfig.json`) with strict mode
  - [ ] Directory structure created (controllers, routes, etc.)
  - [ ] Basic Express server runs without errors

- [ ] **Database Setup**
  - [ ] MySQL database created
  - [ ] Prisma schema completed with all models (User, Product, CartItem, Order, OrderItem)
  - [ ] Prisma Client generated successfully
  - [ ] Initial migration applied
  - [ ] Seed data populated (test user + 6 products)

- [ ] **Environment Configuration**
  - [ ] `.env` file created with all required variables
  - [ ] `.gitignore` properly configured
  - [ ] Environment variables loading correctly

### Testing Commands

Run these commands to verify setup:

```bash
# From root directory
npm install

# Test backend server
cd apps/api
npm run dev
# Should start on http://localhost:3001

# Test database connection
cd apps/api
npx prisma studio
# Should open Prisma Studio and show seeded data

# Verify Prisma Client
cd apps/api
npx prisma generate
# Should complete without errors
```

### Expected Outputs

1. **Server Start:**

   ```
   🚀 Server running on http://localhost:3001
   📊 Environment: development
   ```

2. **Database Check:**
   - Prisma Studio shows 1 user (test@example.com)
   - Prisma Studio shows 6 products in different categories

3. **Health Check:**
   ```bash
   curl http://localhost:3001/health
   # Response: {"status":"ok","timestamp":"..."}
   ```

---

## 🚨 Common Issues & Solutions

### Issue: MySQL Connection Failed

**Solution:** Verify MySQL is running and DATABASE_URL is correct

```bash
mysql -u root -p
CREATE DATABASE ecommerce;
```

### Issue: Prisma Generate Fails

**Solution:** Ensure schema is valid and dependencies installed

```bash
cd apps/api
npm install @prisma/client prisma
npx prisma generate
```

### Issue: Port Already in Use

**Solution:** Change PORT in `.env` or kill process on port 3001

```bash
lsof -ti:3001 | xargs kill -9
```

---

## 📦 Deliverables

At the end of this session, you should have:

1. ✅ Fully configured Turborepo monorepo
2. ✅ Backend workspace with Express server running
3. ✅ Complete Prisma schema with all eCommerce models
4. ✅ MySQL database with migrated schema
5. ✅ Seeded test data (1 user, 6 products)
6. ✅ Environment variables configured
7. ✅ Basic health check endpoint working
8. ✅ Project documentation (README)

---

## 🔄 Next Session

**Session 2: Shared Packages & Design System**

Will cover:

- `packages/types` - Shared TypeScript types
- `packages/ui` - Reusable UI components
- `packages/config` - ESLint, TypeScript, Tailwind configs
- `packages/utils` - Shared utility functions
- Design system implementation from DESIGN.md

---

## 📚 Reference Documents

- `/ai-blueprint/architecture.md` - System architecture overview
- `/ai-blueprint/engineering-guidelines.md` - Code standards
- `/DESIGN.md` - Design system specification
- Prisma Documentation: https://www.prisma.io/docs
- Turborepo Documentation: https://turbo.build/repo/docs

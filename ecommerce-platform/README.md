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

1. Install dependencies:

   ```bash
   npm install
   ```

2. Set up MySQL database:

   ```sql
   CREATE DATABASE ecommerce;
   ```

3. Configure environment variables:

   ```bash
   cp apps/api/.env.example apps/api/.env
   # Update DATABASE_URL with your MySQL credentials
   ```

4. Run database migrations:

   ```bash
   cd apps/api
   npm run prisma:generate
   npm run prisma:migrate
   npm run prisma:seed
   cd ../..
   ```

5. Start development servers:
   ```bash
   npm run dev
   ```

## Development Commands

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all apps for production
- `npm run test` - Run tests across all workspaces
- `npm run lint` - Lint code
- `npm run type-check` - TypeScript type checking

## Project Structure

```
ecommerce-platform/
├── apps/
│   ├── web/       # React frontend (Vite)
│   └── api/       # Express backend (Node.js)
├── packages/
│   ├── ui/        # Shared UI components
│   ├── types/     # Shared TypeScript types
│   ├── config/    # Shared configurations (ESLint, TypeScript, Tailwind)
│   └── utils/     # Shared utilities
├── turbo.json     # Turborepo pipeline configuration
└── package.json   # Root package.json with workspaces
```

## Implementation Sessions

This project follows a phased approach:

- ✅ **Session 1:** Foundation & Database Setup
- **Session 2:** Shared Packages (UI, Types, Config, Utils)
- **Session 3:** Backend Authentication
- **Session 4:** Backend Products & Cart
- **Session 5:** Backend Orders & User Management
- **Session 6:** Frontend Core & Auth
- **Session 7:** Frontend Products Catalog
- **Session 8:** Frontend Cart & Checkout
- **Session 9:** Frontend Account & Modern Features
- **Session 10:** Testing & QA

## Environment Variables

### Backend (`apps/api/.env`)

```bash
DATABASE_URL="mysql://root:password@localhost:3306/ecommerce"
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## Database Access

View database with Prisma Studio:

```bash
cd apps/api
npx prisma studio
```

## License

Private - Internal Use Only

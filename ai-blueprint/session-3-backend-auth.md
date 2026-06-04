# Session 3: Backend - Authentication System

## 🎯 Session Objectives

Implement a complete, production-grade authentication system:

- JWT token generation and verification (access + refresh tokens)
- Auth controllers and routes (register, login, refresh, logout, me)
- Authentication middleware for protected routes
- Password hashing with bcrypt
- Zod validation integration
- Error handling middleware

**Duration Estimate:** 2-3 hours  
**Dependencies:** Session 1 (Foundation), Session 2 (Shared Packages)

---

## 📋 Required Context

Before starting, review these documents:

1. **`/ai-blueprint/capability-definitions.md`** - JWT authentication patterns
2. **`/ai-blueprint/architecture.md`** - Authentication flow diagram
3. **`/ai-blueprint/engineering-guidelines.md`** - Security guidelines
4. **Session 1** - Prisma setup and User model

---

## 🏗 Implementation Steps

### Step 1: Create Auth Service Layer

Create `apps/api/src/services/auth.service.ts`:

```typescript
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma/client";
import { RegisterInput, LoginInput } from "@repo/utils";

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";

interface TokenPayload {
  userId: string;
  email: string;
}

export class AuthService {
  // Hash password
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  }

  // Compare password
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  // Generate access token
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  // Generate refresh token
  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  }

  // Verify access token
  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  }

  // Verify refresh token
  verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, REFRESH_TOKEN_SECRET) as TokenPayload;
  }

  // Register new user
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password_hash: passwordHash,
        first_name: data.first_name,
        last_name: data.last_name,
      },
    });

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      accessToken,
      refreshToken,
    };
  }

  // Login user
  async login(data: LoginInput) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(
      data.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid credentials");
    }

    // Generate tokens
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    return {
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      accessToken,
      refreshToken,
    };
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.verifyRefreshToken(refreshToken);

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new Error("User not found");
      }

      // Generate new access token
      const newPayload: TokenPayload = {
        userId: user.id,
        email: user.email,
      };

      const accessToken = this.generateAccessToken(newPayload);

      return { accessToken };
    } catch (error) {
      throw new Error("Invalid refresh token");
    }
  }

  // Get current user
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}

export const authService = new AuthService();
```

### Step 2: Create Auth Middleware

Create `apps/api/src/middleware/auth.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        error: {
          code: "UNAUTHORIZED",
          message: "Authentication required",
        },
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = authService.verifyAccessToken(token);
      req.user = payload;
      next();
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: "INVALID_TOKEN",
          message: "Invalid or expired token",
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Authentication error",
      },
    });
  }
};
```

### Step 3: Create Validation Middleware

Create `apps/api/src/middleware/validation.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";

export const validate = (schema: AnyZodObject) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Validation failed",
            details: error.errors,
          },
        });
      } else {
        next(error);
      }
    }
  };
};
```

### Step 4: Create Error Handling Middleware

Create `apps/api/src/middleware/error.middleware.ts`:

```typescript
import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code: string = "ERROR",
    public isOperational: boolean = true,
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Handle specific error types
  if (err.message.includes("already exists")) {
    res.status(409).json({
      success: false,
      error: {
        code: "CONFLICT",
        message: err.message,
      },
    });
    return;
  }

  if (err.message.includes("Invalid credentials")) {
    res.status(401).json({
      success: false,
      error: {
        code: "INVALID_CREDENTIALS",
        message: err.message,
      },
    });
    return;
  }

  if (err.message.includes("not found")) {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: err.message,
      },
    });
    return;
  }

  // Default error
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "An unexpected error occurred",
    },
  });
};

export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
};
```

### Step 5: Create Auth Controller

Create `apps/api/src/controllers/auth.controller.ts`:

```typescript
import { Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AuthRequest } from "../middleware/auth.middleware";

export class AuthController {
  // Register new user
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Refresh access token
  async refresh(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Refresh token is required",
          },
        });
        return;
      }

      const result = await authService.refreshAccessToken(refreshToken);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User not authenticated",
          },
        });
        return;
      }

      const user = await authService.getCurrentUser(req.user.userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  // Logout (client-side token removal)
  async logout(req: AuthRequest, res: Response, next: NextFunction) {
    res.status(200).json({
      success: true,
      data: {
        message: "Logged out successfully",
      },
    });
  }
}

export const authController = new AuthController();
```

### Step 6: Create Auth Routes

Create `apps/api/src/routes/auth.routes.ts`:

```typescript
import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { loginSchema, registerSchema } from "@repo/utils";

const router = Router();

// Validation schemas
const registerValidation = z.object({
  body: registerSchema,
});

const loginValidation = z.object({
  body: loginSchema,
});

const refreshValidation = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

// Routes
router.post(
  "/register",
  validate(registerValidation),
  authController.register.bind(authController),
);

router.post(
  "/login",
  validate(loginValidation),
  authController.login.bind(authController),
);

router.post(
  "/refresh",
  validate(refreshValidation),
  authController.refresh.bind(authController),
);

router.post("/logout", authController.logout.bind(authController));

router.get(
  "/me",
  authenticate,
  authController.getCurrentUser.bind(authController),
);

export default router;
```

### Step 7: Update Server Entry Point

Update `apps/api/src/server.ts`:

```typescript
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware";

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

// API Routes
app.use("/api/auth", authRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

export default app;
```

### Step 8: Create Auth Tests

Create `apps/api/src/controllers/__tests__/auth.controller.test.ts`:

```typescript
import request from "supertest";
import app from "../../server";
import { prisma } from "../../prisma/client";

describe("Auth Controller", () => {
  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: { contains: "test" } },
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test-register@example.com",
        password: "Password123",
        first_name: "Test",
        last_name: "User",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("user");
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
      expect(response.body.data.user.email).toBe("test-register@example.com");
    });

    it("should return error for duplicate email", async () => {
      // First registration
      await request(app).post("/api/auth/register").send({
        email: "test-duplicate@example.com",
        password: "Password123",
        first_name: "Test",
        last_name: "User",
      });

      // Duplicate registration
      const response = await request(app).post("/api/auth/register").send({
        email: "test-duplicate@example.com",
        password: "Password123",
        first_name: "Test",
        last_name: "User",
      });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it("should return validation error for invalid password", async () => {
      const response = await request(app).post("/api/auth/register").send({
        email: "test@example.com",
        password: "weak",
        first_name: "Test",
        last_name: "User",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/auth/login", () => {
    beforeAll(async () => {
      // Create test user
      await request(app).post("/api/auth/register").send({
        email: "test-login@example.com",
        password: "Password123",
        first_name: "Test",
        last_name: "User",
      });
    });

    it("should login with valid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test-login@example.com",
        password: "Password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("accessToken");
      expect(response.body.data).toHaveProperty("refreshToken");
    });

    it("should return error for invalid credentials", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test-login@example.com",
        password: "WrongPassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    let accessToken: string;

    beforeAll(async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test-login@example.com",
        password: "Password123",
      });
      accessToken = response.body.data.accessToken;
    });

    it("should return current user with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe("test-login@example.com");
    });

    it("should return error without token", async () => {
      const response = await request(app).get("/api/auth/me");

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
```

---

## ✅ Quality Assessment Criteria

### Verification Checklist

Before moving to the next session, verify:

- [ ] **Auth Service**
  - [ ] Password hashing with bcrypt (12 salt rounds)
  - [ ] JWT token generation (access + refresh)
  - [ ] Token verification methods
  - [ ] Register, login, refresh functionality
  - [ ] Error handling for duplicate users and invalid credentials

- [ ] **Middleware**
  - [ ] Authentication middleware extracts and verifies JWT
  - [ ] Validation middleware integrates Zod schemas
  - [ ] Error handler catches and formats all errors
  - [ ] 404 handler for unknown routes

- [ ] **Auth Controller**
  - [ ] All 5 endpoints implemented (register, login, refresh, logout, me)
  - [ ] Proper error handling with try-catch
  - [ ] Correct HTTP status codes (201, 200, 401, etc.)

- [ ] **Auth Routes**
  - [ ] All routes properly defined
  - [ ] Validation middleware applied
  - [ ] Authentication middleware on /me endpoint
  - [ ] Controllers properly bound

- [ ] **Tests**
  - [ ] Registration tests pass
  - [ ] Login tests pass
  - [ ] Protected route tests pass
  - [ ] Error case tests pass

### Testing Commands

Run these commands to verify setup:

```bash
# From apps/api directory
cd apps/api

# Install dependencies
npm install

# Run server
npm run dev
# Should start without errors

# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123",
    "first_name": "Test",
    "last_name": "User"
  }'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "Password123"
  }'

# Test protected route (use token from login response)
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Run tests
npm test
```

### Expected Outputs

1. **Registration Response:**

   ```json
   {
     "success": true,
     "data": {
       "user": {
         "id": "...",
         "email": "testuser@example.com",
         "first_name": "Test",
         "last_name": "User"
       },
       "accessToken": "...",
       "refreshToken": "..."
     }
   }
   ```

2. **Login Response:**

   ```json
   {
     "success": true,
     "data": {
       "user": {...},
       "accessToken": "...",
       "refreshToken": "..."
     }
   }
   ```

3. **Protected Route (Me) Response:**
   ```json
   {
     "success": true,
     "data": {
       "user": {
         "id": "...",
         "email": "testuser@example.com",
         "first_name": "Test",
         "last_name": "User"
       }
     }
   }
   ```

---

## 🚨 Common Issues & Solutions

### Issue: JWT Secret Not Set

**Solution:** Ensure `.env` file has JWT secrets

```bash
JWT_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=your-refresh-secret-here
```

### Issue: Bcrypt Installation Fails

**Solution:** Install build tools

```bash
# macOS
xcode-select --install

# Ubuntu/Debian
sudo apt-get install build-essential
```

### Issue: Token Verification Fails

**Solution:** Check token format and secret

```typescript
// Ensure Bearer format: "Bearer <token>"
const token = authHeader.split(" ")[1];
```

---

## 📦 Deliverables

At the end of this session, you should have:

1. ✅ Complete auth service with JWT and bcrypt
2. ✅ Authentication middleware for protected routes
3. ✅ Validation middleware with Zod
4. ✅ Error handling middleware
5. ✅ Auth controller with all endpoints
6. ✅ Auth routes properly configured
7. ✅ Comprehensive test suite
8. ✅ All auth endpoints working end-to-end

---

## 🔄 Next Session

**Session 4: Backend - Products & Cart APIs**

Will cover:

- Product service and controller
- Product CRUD endpoints with filtering/search/sort
- Cart service and controller
- Cart management endpoints
- Advanced Prisma queries

---

## 📚 Reference Documents

- `/ai-blueprint/capability-definitions.md` - JWT patterns
- `/ai-blueprint/architecture.md` - Auth flow
- `/ai-blueprint/engineering-guidelines.md` - Security standards
- JWT.io: https://jwt.io/
- Bcrypt: https://github.com/kelektiv/node.bcrypt.js

# Session 5: Backend - Orders & User Profile APIs

## 🎯 Session Objectives

Complete the backend with order management and user profile endpoints:

- Order service (create order, list orders, get order details)
- Order endpoints with proper authorization
- User profile endpoints (get, update)
- Backend integration testing
- Final backend verification

**Duration Estimate:** 2-3 hours  
**Dependencies:** Sessions 1-4 (all previous backend sessions)

---

## 📋 Required Context

1. **`/ai-blueprint/architecture.md`** - Order schema and relationships
2. **`/ai-blueprint/capability-definitions.md`** - Service patterns
3. **Sessions 1-4** - Database, auth, products, cart implementation

---

## 🏗 Implementation Steps

### Step 1: Create Order Service

Create `apps/api/src/services/order.service.ts`:

```typescript
import { prisma } from "../prisma/client";
import { CreateOrderInput } from "@repo/utils";
import { OrderStatus } from "@prisma/client";

export class OrderService {
  async createOrder(userId: string, data: CreateOrderInput) {
    const { shipping_address, items, total_amount } = data;

    // Verify all products exist and have sufficient stock
    const productIds = items.map((item) => item.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      throw new Error("One or more products not found");
    }

    // Check stock availability
    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product?.name}`);
      }
    }

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          user_id: userId,
          status: OrderStatus.PENDING,
          total_amount,
          shipping_address,
          order_items: {
            create: items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          order_items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Clear user's cart
      await tx.cartItem.deleteMany({
        where: { user_id: userId },
      });

      return newOrder;
    });

    return {
      ...order,
      total_amount: Number(order.total_amount),
      order_items: order.order_items.map((item) => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      })),
    };
  }

  async getOrders(
    userId: string,
    filters?: { status?: OrderStatus; page?: number; limit?: number },
  ) {
    const { status, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const where = {
      user_id: userId,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          order_items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => ({
        ...order,
        total_amount: Number(order.total_amount),
        order_items: order.order_items.map((item) => ({
          ...item,
          price: Number(item.price),
          product: {
            ...item.product,
            price: Number(item.product.price),
          },
        })),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: userId,
      },
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return {
      ...order,
      total_amount: Number(order.total_amount),
      order_items: order.order_items.map((item) => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      })),
    };
  }
}

export const orderService = new OrderService();
```

### Step 2: Create User Service

Create `apps/api/src/services/user.service.ts`:

```typescript
import { prisma } from "../prisma/client";
import { UpdateProfileInput } from "@repo/utils";

export class UserService {
  async getProfile(userId: string) {
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

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const { first_name, last_name, email } = data;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUser) {
        throw new Error("Email already in use");
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(first_name && { first_name }),
        ...(last_name && { last_name }),
        ...(email && { email }),
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        created_at: true,
        updated_at: true,
      },
    });

    return user;
  }
}

export const userService = new UserService();
```

### Step 3: Create Order Controller

Create `apps/api/src/controllers/order.controller.ts`:

```typescript
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { orderService } from "../services/order.service";
import { OrderStatus } from "@prisma/client";

export class OrderController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const order = await orderService.createOrder(req.user.userId, req.body);

      res.status(201).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const filters = {
        status: req.query.status as OrderStatus,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await orderService.getOrders(req.user.userId, filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const { id } = req.params;
      const order = await orderService.getOrderById(req.user.userId, id);

      res.status(200).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();
```

### Step 4: Create User Controller

Create `apps/api/src/controllers/user.controller.ts`:

```typescript
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { userService } from "../services/user.service";

export class UserController {
  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const user = await userService.getProfile(req.user.userId);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const user = await userService.updateProfile(req.user.userId, req.body);

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
```

### Step 5: Create Order Routes

Create `apps/api/src/routes/order.routes.ts`:

```typescript
import { Router } from "express";
import { z } from "zod";
import { orderController } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { createOrderSchema } from "@repo/utils";

const router = Router();

// All order routes require authentication
router.use(authenticate);

const createOrderValidation = z.object({
  body: createOrderSchema,
});

const getOrderValidation = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

router.post(
  "/",
  validate(createOrderValidation),
  orderController.create.bind(orderController),
);
router.get("/", orderController.list.bind(orderController));
router.get(
  "/:id",
  validate(getOrderValidation),
  orderController.getById.bind(orderController),
);

export default router;
```

### Step 6: Create User Routes

Create `apps/api/src/routes/user.routes.ts`:

```typescript
import { Router } from "express";
import { z } from "zod";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { updateProfileSchema } from "@repo/utils";

const router = Router();

// All user routes require authentication
router.use(authenticate);

const updateProfileValidation = z.object({
  body: updateProfileSchema,
});

router.get("/profile", userController.getProfile.bind(userController));
router.put(
  "/profile",
  validate(updateProfileValidation),
  userController.updateProfile.bind(userController),
);

export default router;
```

### Step 7: Update Server with Final Routes

Update `apps/api/src/server.ts`:

```typescript
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import authRoutes from "./routes/auth.routes";
import productRoutes from "./routes/product.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import userRoutes from "./routes/user.routes";
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
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ All API endpoints ready`);
});

export default app;
```

---

## ✅ Quality Assessment Criteria

### Verification Checklist

- [ ] **Order Service**
  - [ ] Create order with transaction (order + items + stock update + clear cart)
  - [ ] List orders with filtering and pagination
  - [ ] Get single order with authorization check
  - [ ] Stock validation before order creation

- [ ] **User Service**
  - [ ] Get user profile
  - [ ] Update profile with email uniqueness check
  - [ ] Proper data validation

- [ ] **All Backend Routes**
  - [ ] Auth: register, login, refresh, logout, me
  - [ ] Products: list, get, categories
  - [ ] Cart: get, add, update, remove, clear
  - [ ] Orders: create, list, get
  - [ ] Users: get profile, update profile

### Complete Backend Testing

```bash
# Test complete flow
# 1. Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "Password123",
    "first_name": "John",
    "last_name": "Doe"
  }'

# 2. Login (save token)
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "Password123"
  }' | jq -r '.data.accessToken')

# 3. Get products
curl http://localhost:3001/api/products

# 4. Add to cart
curl -X POST http://localhost:3001/api/cart/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "PRODUCT_ID", "quantity": 1}'

# 5. Get cart
curl http://localhost:3001/api/cart \
  -H "Authorization: Bearer $TOKEN"

# 6. Create order
curl -X POST http://localhost:3001/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "shipping_address": "123 Main St, City, State 12345",
    "items": [{"product_id": "PRODUCT_ID", "quantity": 1, "price": 199.99}],
    "total_amount": 199.99
  }'

# 7. Get order history
curl http://localhost:3001/api/orders \
  -H "Authorization: Bearer $TOKEN"

# 8. Get profile
curl http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# 9. Update profile
curl -X PUT http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Jane"}'
```

---

## 📦 Deliverables

1. ✅ Order service with transaction support
2. ✅ User profile service
3. ✅ Order endpoints (create, list, get)
4. ✅ User endpoints (get profile, update profile)
5. ✅ Complete backend API ready
6. ✅ All routes tested and working

---

## 🔄 Next Session

**Session 6: Frontend - Core Setup & Authentication**

Will cover:

- React app setup with Vite
- Zustand stores (auth, cart, UI)
- API service layer with Axios
- Auth pages (login, register)
- Protected route implementation
- Design system integration

---

## 📚 Reference Documents

- `/ai-blueprint/architecture.md` - Complete backend architecture
- `/ai-blueprint/capability-definitions.md` - Service patterns
- All previous backend sessions (1-4)

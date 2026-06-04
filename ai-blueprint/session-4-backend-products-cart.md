# Session 4: Backend - Products & Cart APIs

## 🎯 Session Objectives

Build the product catalog and shopping cart backend functionality:

- Product service with advanced Prisma queries
- Product endpoints (list, get, filter, search, sort)
- Cart service with user-specific cart management
- Cart endpoints (get, add, update, delete)
- Pagination and filtering logic

**Duration Estimate:** 2-3 hours  
**Dependencies:** Session 1 (Foundation), Session 2 (Shared Packages), Session 3 (Auth)

---

## 📋 Required Context

Before starting, review these documents:

1. **`/ai-blueprint/architecture.md`** - Database schema and API design
2. **`/ai-blueprint/capability-definitions.md`** - Prisma patterns
3. **Session 1** - Prisma schema (Product, CartItem models)
4. **Session 3** - Auth middleware for protected routes

---

## 🏗 Implementation Steps

### Step 1: Create Product Service

Create `apps/api/src/services/product.service.ts`:

```typescript
import { prisma } from "../prisma/client";
import { ProductFilterInput } from "@repo/utils";
import { Prisma } from "@prisma/client";

export class ProductService {
  async getProducts(filters: ProductFilterInput) {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = "newest",
      page = 1,
      limit = 20,
    } = filters;

    // Build where clause
    const where: Prisma.ProductWhereInput = {
      ...(category && { category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as any } },
          { description: { contains: search, mode: "insensitive" as any } },
        ],
      }),
      ...(minPrice !== undefined && { price: { gte: minPrice } }),
      ...(maxPrice !== undefined && {
        price: { lte: maxPrice, ...(minPrice && { gte: minPrice }) },
      }),
    };

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case "price_asc":
        orderBy = { price: "asc" };
        break;
      case "price_desc":
        orderBy = { price: "desc" };
        break;
      case "name":
        orderBy = { name: "asc" };
        break;
      case "newest":
      default:
        orderBy = { created_at: "desc" };
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Execute queries
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products: products.map((p) => ({
        ...p,
        price: Number(p.price),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    return {
      ...product,
      price: Number(product.price),
    };
  }

  async getCategories() {
    const categories = await prisma.product.groupBy({
      by: ["category"],
      _count: {
        category: true,
      },
    });

    return categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    }));
  }
}

export const productService = new ProductService();
```

### Step 2: Create Cart Service

Create `apps/api/src/services/cart.service.ts`:

```typescript
import { prisma } from "../prisma/client";
import { AddToCartInput, UpdateCartItemInput } from "@repo/utils";

export class CartService {
  async getCart(userId: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: userId },
      include: {
        product: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    const items = cartItems.map((item) => ({
      id: item.id,
      user_id: item.user_id,
      product_id: item.product_id,
      quantity: item.quantity,
      created_at: item.created_at,
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
    }));

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    return {
      items,
      totalItems,
      totalPrice,
    };
  }

  async addItem(userId: string, data: AddToCartInput) {
    const { product_id, quantity = 1 } = data;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    // Check if product is in stock
    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id,
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity;

      if (product.stock < newQuantity) {
        throw new Error("Insufficient stock");
      }

      const updated = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      });

      return {
        ...updated,
        product: {
          ...updated.product,
          price: Number(updated.product.price),
        },
      };
    }

    // Create new cart item
    const cartItem = await prisma.cartItem.create({
      data: {
        user_id: userId,
        product_id,
        quantity,
      },
      include: {
        product: true,
      },
    });

    return {
      ...cartItem,
      product: {
        ...cartItem.product,
        price: Number(cartItem.product.price),
      },
    };
  }

  async updateItem(userId: string, itemId: string, data: UpdateCartItemInput) {
    const { quantity } = data;

    // Find cart item
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        user_id: userId,
      },
      include: {
        product: true,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    // Check stock
    if (cartItem.product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    // Update quantity
    const updated = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    });

    return {
      ...updated,
      product: {
        ...updated.product,
        price: Number(updated.product.price),
      },
    };
  }

  async removeItem(userId: string, itemId: string) {
    // Verify ownership
    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: itemId,
        user_id: userId,
      },
    });

    if (!cartItem) {
      throw new Error("Cart item not found");
    }

    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    return { message: "Item removed from cart" };
  }

  async clearCart(userId: string) {
    await prisma.cartItem.deleteMany({
      where: { user_id: userId },
    });

    return { message: "Cart cleared" };
  }
}

export const cartService = new CartService();
```

### Step 3: Create Product Controller

Create `apps/api/src/controllers/product.controller.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { productService } from "../services/product.service";

export class ProductController {
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const filters = {
        category: req.query.category as string,
        search: req.query.search as string,
        minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
        maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
        sortBy: req.query.sortBy as any,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await productService.getProducts(filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      res.status(200).json({
        success: true,
        data: { product },
      });
    } catch (error) {
      next(error);
    }
  }

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await productService.getCategories();

      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const productController = new ProductController();
```

### Step 4: Create Cart Controller

Create `apps/api/src/controllers/cart.controller.ts`:

```typescript
import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { cartService } from "../services/cart.service";

export class CartController {
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const cart = await cartService.getCart(req.user.userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const item = await cartService.addItem(req.user.userId, req.body);

      res.status(201).json({
        success: true,
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const { id } = req.params;
      const item = await cartService.updateItem(req.user.userId, id, req.body);

      res.status(200).json({
        success: true,
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const { id } = req.params;
      const result = await cartService.removeItem(req.user.userId, id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const result = await cartService.clearCart(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();
```

### Step 5: Create Product Routes

Create `apps/api/src/routes/product.routes.ts`:

```typescript
import { Router } from "express";
import { productController } from "../controllers/product.controller";

const router = Router();

router.get("/", productController.list.bind(productController));
router.get(
  "/categories",
  productController.getCategories.bind(productController),
);
router.get("/:id", productController.getById.bind(productController));

export default router;
```

### Step 6: Create Cart Routes

Create `apps/api/src/routes/cart.routes.ts`:

```typescript
import { Router } from "express";
import { z } from "zod";
import { cartController } from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { addToCartSchema, updateCartItemSchema } from "@repo/utils";

const router = Router();

// All cart routes require authentication
router.use(authenticate);

const addItemValidation = z.object({
  body: addToCartSchema,
});

const updateItemValidation = z.object({
  body: updateCartItemSchema,
  params: z.object({
    id: z.string().uuid(),
  }),
});

const deleteItemValidation = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

router.get("/", cartController.getCart.bind(cartController));
router.post(
  "/items",
  validate(addItemValidation),
  cartController.addItem.bind(cartController),
);
router.put(
  "/items/:id",
  validate(updateItemValidation),
  cartController.updateItem.bind(cartController),
);
router.delete(
  "/items/:id",
  validate(deleteItemValidation),
  cartController.removeItem.bind(cartController),
);
router.delete("/", cartController.clearCart.bind(cartController));

export default router;
```

### Step 7: Update Server to Include New Routes

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

---

## ✅ Quality Assessment Criteria

### Verification Checklist

- [ ] **Product Service**
  - [ ] Filtering by category, price range
  - [ ] Search by name and description
  - [ ] Sorting (price asc/desc, newest, name)
  - [ ] Pagination with metadata
  - [ ] Get single product by ID
  - [ ] Get categories list

- [ ] **Cart Service**
  - [ ] Get user cart with products
  - [ ] Add item (handles existing items)
  - [ ] Update item quantity
  - [ ] Remove item (with ownership check)
  - [ ] Clear cart
  - [ ] Stock validation

- [ ] **Controllers & Routes**
  - [ ] All endpoints respond correctly
  - [ ] Protected routes require authentication
  - [ ] Validation middleware applied
  - [ ] Error handling works

### Testing Commands

```bash
# Get all products
curl http://localhost:3001/api/products

# Filter products
curl "http://localhost:3001/api/products?category=Electronics&sortBy=price_asc"

# Search products
curl "http://localhost:3001/api/products?search=wireless"

# Get single product
curl http://localhost:3001/api/products/PRODUCT_ID

# Get cart (requires auth)
curl http://localhost:3001/api/cart \
  -H "Authorization: Bearer YOUR_TOKEN"

# Add to cart
curl -X POST http://localhost:3001/api/cart/items \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id": "PRODUCT_ID", "quantity": 2}'

# Update cart item
curl -X PUT http://localhost:3001/api/cart/items/CART_ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"quantity": 3}'

# Remove cart item
curl -X DELETE http://localhost:3001/api/cart/items/CART_ITEM_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📦 Deliverables

1. ✅ Product service with advanced filtering
2. ✅ Cart service with stock validation
3. ✅ Product endpoints (list, get, categories)
4. ✅ Cart endpoints (get, add, update, delete, clear)
5. ✅ All routes properly secured
6. ✅ Pagination and sorting working

---

## 🔄 Next Session

**Session 5: Backend - Orders & User Profile APIs**

Will cover:

- Order service and controller
- Create order endpoint
- Order history endpoints
- User profile management
- Complete backend testing

---

## 📚 Reference Documents

- `/ai-blueprint/architecture.md` - Database schema
- `/ai-blueprint/capability-definitions.md` - Prisma patterns
- Prisma Docs: https://www.prisma.io/docs

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

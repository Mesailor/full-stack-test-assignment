import { User, Product, CartItem, Order, OrderStatus } from "./models";

// Common API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Auth API types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Product API types
export interface ProductListQuery {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "price_asc" | "price_desc" | "newest" | "name";
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  meta: PaginationMeta;
}

// Cart API types
export interface AddToCartRequest {
  product_id: string;
  quantity?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

// Order API types
export interface CreateOrderRequest {
  shipping_address: string;
  items: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
  total_amount: number;
}

export interface OrderListQuery {
  status?: OrderStatus;
  page?: number;
  limit?: number;
}

export interface OrderListResponse {
  orders: Order[];
  meta: PaginationMeta;
}

// User API types
export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface UserProfileResponse {
  user: User;
}

import { api } from "./api";
import type { Product } from "@repo/types";

export const productService = {
  async getProducts(params?: {
    category?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get("/products", { params });
    return response.data.data;
  },

  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/products/${id}`);
    return response.data.data.product;
  },

  async getCategories() {
    const response = await api.get("/products/categories");
    return response.data.data.categories;
  },
};

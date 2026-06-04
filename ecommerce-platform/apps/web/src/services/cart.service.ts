import { api } from "./api";
import type { CartResponse, AddToCartRequest } from "@repo/types";

export const cartService = {
  async getCart(): Promise<CartResponse> {
    const response = await api.get("/cart");
    return response.data.data;
  },

  async addItem(data: AddToCartRequest) {
    const response = await api.post("/cart/items", data);
    return response.data.data.item;
  },

  async updateItem(itemId: string, quantity: number) {
    const response = await api.put(`/cart/items/${itemId}`, { quantity });
    return response.data.data.item;
  },

  async removeItem(itemId: string) {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data.data;
  },

  async clearCart() {
    const response = await api.delete("/cart");
    return response.data.data;
  },
};

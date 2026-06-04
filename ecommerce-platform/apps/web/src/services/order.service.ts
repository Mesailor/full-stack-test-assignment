import { api } from "./api";
import type { CreateOrderRequest, Order } from "@repo/types";

export const orderService = {
  async createOrder(data: CreateOrderRequest): Promise<Order> {
    const response = await api.post("/orders", data);
    return response.data.data.order;
  },

  async getOrders(params?: { status?: string; page?: number; limit?: number }) {
    const response = await api.get("/orders", { params });
    return response.data.data;
  },

  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data.order;
  },
};

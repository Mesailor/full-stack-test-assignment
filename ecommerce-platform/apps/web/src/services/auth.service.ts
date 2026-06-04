import { api } from "./api";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@repo/types";

export const authService = {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/register", data);
    return response.data.data;
  },

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post("/auth/login", data);
    return response.data.data;
  },

  async logout(): Promise<void> {
    await api.post("/auth/logout");
  },

  async getCurrentUser() {
    const response = await api.get("/auth/me");
    return response.data.data.user;
  },
};

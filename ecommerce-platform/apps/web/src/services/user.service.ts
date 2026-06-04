import { api } from "./api";
import type { User, UpdateProfileRequest } from "@repo/types";

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get("/users/profile");
    return response.data.data.user;
  },

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.put("/users/profile", data);
    return response.data.data.user;
  },
};

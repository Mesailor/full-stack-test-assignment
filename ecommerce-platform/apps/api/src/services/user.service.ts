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

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: userId },
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

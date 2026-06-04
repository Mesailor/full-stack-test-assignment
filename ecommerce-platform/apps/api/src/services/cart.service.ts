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

    const product = await prisma.product.findUnique({
      where: { id: product_id },
    });

    if (!product) {
      throw new Error("Product not found");
    }

    if (product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id,
        },
      },
    });

    if (existingItem) {
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

    if (cartItem.product.stock < quantity) {
      throw new Error("Insufficient stock");
    }

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

import { prisma } from "../prisma/client";
import { CreateOrderInput } from "@repo/utils";
import { OrderStatus } from "@prisma/client";

export class OrderService {
  async createOrder(userId: string, data: CreateOrderInput) {
    const { shipping_address, items, total_amount } = data;

    const productIds = items.map((item) => item.product_id);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== items.length) {
      throw new Error("One or more products not found");
    }

    for (const item of items) {
      const product = products.find((p) => p.id === item.product_id);
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product?.name}`);
      }
    }

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          user_id: userId,
          status: OrderStatus.PENDING,
          total_amount,
          shipping_address,
          order_items: {
            create: items.map((item) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          order_items: {
            include: {
              product: true,
            },
          },
        },
      });

      for (const item of items) {
        await tx.product.update({
          where: { id: item.product_id },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      await tx.cartItem.deleteMany({
        where: { user_id: userId },
      });

      return newOrder;
    });

    return {
      ...order,
      total_amount: Number(order.total_amount),
      order_items: order.order_items.map((item) => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      })),
    };
  }

  async getOrders(
    userId: string,
    filters?: { status?: OrderStatus; page?: number; limit?: number },
  ) {
    const { status, page = 1, limit = 20 } = filters || {};
    const skip = (page - 1) * limit;

    const where = {
      user_id: userId,
      ...(status && { status }),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          order_items: {
            include: {
              product: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders: orders.map((order) => ({
        ...order,
        total_amount: Number(order.total_amount),
        order_items: order.order_items.map((item) => ({
          ...item,
          price: Number(item.price),
          product: {
            ...item.product,
            price: Number(item.product.price),
          },
        })),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrderById(userId: string, orderId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: userId,
      },
      include: {
        order_items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Order not found");
    }

    return {
      ...order,
      total_amount: Number(order.total_amount),
      order_items: order.order_items.map((item) => ({
        ...item,
        price: Number(item.price),
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      })),
    };
  }
}

export const orderService = new OrderService();

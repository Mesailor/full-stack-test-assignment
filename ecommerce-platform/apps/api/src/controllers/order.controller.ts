import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { orderService } from "../services/order.service";
import { OrderStatus } from "@prisma/client";

export class OrderController {
  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const order = await orderService.createOrder(req.user.userId, req.body);

      res.status(201).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const filters = {
        status: req.query.status as OrderStatus,
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      };

      const result = await orderService.getOrders(req.user.userId, filters);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const { id } = req.params;
      const order = await orderService.getOrderById(req.user.userId, id);

      res.status(200).json({
        success: true,
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const orderController = new OrderController();

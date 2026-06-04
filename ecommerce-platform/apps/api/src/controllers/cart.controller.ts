import { Response, NextFunction } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { cartService } from "../services/cart.service";

export class CartController {
  async getCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const cart = await cartService.getCart(req.user.userId);

      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  async addItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const item = await cartService.addItem(req.user.userId, req.body);

      res.status(201).json({
        success: true,
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const { id } = req.params;
      const item = await cartService.updateItem(req.user.userId, id, req.body);

      res.status(200).json({
        success: true,
        data: { item },
      });
    } catch (error) {
      next(error);
    }
  }

  async removeItem(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const { id } = req.params;
      const result = await cartService.removeItem(req.user.userId, id);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async clearCart(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: { code: "UNAUTHORIZED", message: "User not authenticated" },
        });
        return;
      }

      const result = await cartService.clearCart(req.user.userId);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const cartController = new CartController();

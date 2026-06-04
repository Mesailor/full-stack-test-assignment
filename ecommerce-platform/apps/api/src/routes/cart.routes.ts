import { Router } from "express";
import { z } from "zod";
import { cartController } from "../controllers/cart.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { addToCartSchema, updateCartItemSchema } from "@repo/utils";

const router = Router();

router.use(authenticate);

const addItemValidation = z.object({
  body: addToCartSchema,
});

const updateItemValidation = z.object({
  body: updateCartItemSchema,
  params: z.object({
    id: z.string().uuid(),
  }),
});

const deleteItemValidation = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

router.get("/", cartController.getCart.bind(cartController));
router.post(
  "/items",
  validate(addItemValidation),
  cartController.addItem.bind(cartController),
);
router.put(
  "/items/:id",
  validate(updateItemValidation),
  cartController.updateItem.bind(cartController),
);
router.delete(
  "/items/:id",
  validate(deleteItemValidation),
  cartController.removeItem.bind(cartController),
);
router.delete("/", cartController.clearCart.bind(cartController));

export default router;

import { Router } from "express";
import { z } from "zod";
import { orderController } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { createOrderSchema } from "@repo/utils";

const router = Router();

router.use(authenticate);

const createOrderValidation = z.object({
  body: createOrderSchema,
});

const getOrderValidation = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
});

router.post(
  "/",
  validate(createOrderValidation),
  orderController.create.bind(orderController),
);
router.get("/", orderController.list.bind(orderController));
router.get(
  "/:id",
  validate(getOrderValidation),
  orderController.getById.bind(orderController),
);

export default router;

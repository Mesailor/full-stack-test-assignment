import { Router } from "express";
import { productController } from "../controllers/product.controller";

const router = Router();

router.get("/", productController.list.bind(productController));
router.get("/categories", productController.getCategories.bind(productController));
router.get("/:id", productController.getById.bind(productController));

export default router;

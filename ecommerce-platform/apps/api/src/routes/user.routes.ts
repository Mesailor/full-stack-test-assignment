import { Router } from "express";
import { z } from "zod";
import { userController } from "../controllers/user.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { updateProfileSchema } from "@repo/utils";

const router = Router();

router.use(authenticate);

const updateProfileValidation = z.object({
  body: updateProfileSchema,
});

router.get("/profile", userController.getProfile.bind(userController));
router.put(
  "/profile",
  validate(updateProfileValidation),
  userController.updateProfile.bind(userController),
);

export default router;

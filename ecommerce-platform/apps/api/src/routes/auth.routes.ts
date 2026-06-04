import { Router } from "express";
import { z } from "zod";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { loginSchema, registerSchema } from "@repo/utils";

const router = Router();

// Validation schemas
const registerValidation = z.object({
  body: registerSchema,
});

const loginValidation = z.object({
  body: loginSchema,
});

const refreshValidation = z.object({
  body: z.object({
    refreshToken: z.string(),
  }),
});

// Routes
router.post(
  "/register",
  validate(registerValidation),
  authController.register.bind(authController),
);

router.post(
  "/login",
  validate(loginValidation),
  authController.login.bind(authController),
);

router.post(
  "/refresh",
  validate(refreshValidation),
  authController.refresh.bind(authController),
);

router.post("/logout", authController.logout.bind(authController));

router.get(
  "/me",
  authenticate,
  authController.getCurrentUser.bind(authController),
);

export default router;

import { Router } from "express";

import {
  login,
  logout,
  refresh,
  register,
  deleteUser,
  getUsers,
} from "../controllers/authController.js";

import { validate } from "../middleware/validate.js";

import { loginLimiter } from "../middleware/rateLimiter.js";

import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "../schemas/authSchema.js";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = Router();

router.post(
  "/signup",
  validate(registerSchema),
  register,
);

router.post(
  "/login",
  loginLimiter,
  validate(loginSchema),
  login,
);

router.post(
  "/refresh",
  validate(refreshTokenSchema),
  refresh,
);

router.post(
  "/logout",
  validate(refreshTokenSchema),
  logout,
);

router.get(
  "/users",
  authenticateToken,
  authorizeRoles("admin"),
  getUsers,
);

router.delete(
  "/users/:id",
  authenticateToken,
  authorizeRoles("admin"),
  deleteUser,
);

export default router;


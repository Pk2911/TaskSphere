import { Router } from "express";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

import {
  createProject,
  getProjects,
  getProject,
} from "../controllers/projectController.js";

import {
  createProjectSchema,
} from "../schemas/projectSchema.js";

const router = Router();

router.get(
  "/projects",
  authenticateToken,
  getProjects,
);

router.get(
  "/projects/:id",
  authenticateToken,
  getProject,
);

router.post(
  "/projects",
  authenticateToken,
  validate(createProjectSchema),
  createProject,
);

export default router;
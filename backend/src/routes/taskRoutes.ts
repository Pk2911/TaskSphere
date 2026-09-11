import { Router } from "express";

import { authenticateToken } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  assignTaskToUser,
  moveTaskToDoneController,
} from "../controllers/taskController.js";

import {
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
} from "../schemas/taskSchema.js";

import { validate } from "../middleware/validate.js";

const router = Router();

router.get(
  "/tasks",
  authenticateToken,
  getTasks,
);

router.get(
  "/tasks/:id",
  getTask,
);

router.post(
  "/tasks",
  validate(createTaskSchema),
  createTask,
);

router.patch(
  "/tasks/:id",
  validate(updateTaskSchema),
  updateTask,
);

router.delete(
  "/tasks/:id",
  deleteTask,
);

router.patch(
  "/tasks/:id/assign",
  authenticateToken,
  authorizeRoles("admin"),
  validate(assignTaskSchema),
  assignTaskToUser,
);

router.patch(
  "/tasks/:id/done",
  authenticateToken,
  moveTaskToDoneController,
);

export default router;
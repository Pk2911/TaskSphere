import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  dueDate: z.string().optional(),
  projectId: z.number().int().positive().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().optional(),
  userId: z.number().int().positive().optional(),
  projectId: z.number().int().positive().optional(),
});

export const assignTaskSchema = z.object({
  userId: z.number().int().positive(),
});
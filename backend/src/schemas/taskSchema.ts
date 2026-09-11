import { z } from "zod";

import { taskSchema } from "@tasksphere/shared";

export const createTaskSchema = taskSchema;

export const updateTaskSchema = taskSchema.partial().extend({
  status: z
    .enum(["TODO", "IN_PROGRESS", "DONE"])
    .optional(),
});

export const assignTaskSchema = z.object({
  userId: z.number().int().positive(),
});
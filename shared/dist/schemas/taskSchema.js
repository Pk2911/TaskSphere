import { z } from "zod";
export const taskSchema = z.object({
    title: z
        .string()
        .trim()
        .min(1, "Title is required")
        .max(100, "Title must be 100 characters or less"),
    description: z
        .string()
        .trim()
        .min(1, "Description is required")
        .max(1000, "Description must be 1000 characters or less"),
    userId: z
        .number()
        .int()
        .positive()
        .optional(),
    dueDate: z
        .string()
        .optional(),
    priority: z
        .enum(["LOW", "MEDIUM", "HIGH"])
        .default("MEDIUM"),
    projectId: z
        .number()
        .int()
        .positive()
        .optional(),
});

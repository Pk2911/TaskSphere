import { z } from "zod";
export declare const taskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodString;
    userId: z.ZodOptional<z.ZodNumber>;
    dueDate: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<{
        LOW: "LOW";
        MEDIUM: "MEDIUM";
        HIGH: "HIGH";
    }>>;
    projectId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type TaskFormData = z.infer<typeof taskSchema>;

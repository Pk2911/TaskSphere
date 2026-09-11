import type { Request, Response, NextFunction } from "express";
import { ZodError, type ZodType } from "zod";

export function validate(schema: ZodType) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          message: "Validation failed",
          errors: error.issues,
        });
        return;
      }

      next(error);
    }
  };
}
import type { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler.js";

export function authorizeRoles(
  ...allowedRoles: Array<"admin" | "member">
) {
  return (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      next(new AppError("Authentication required", 401));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new AppError("Access denied", 403));
      return;
    }

    next();
  };
}
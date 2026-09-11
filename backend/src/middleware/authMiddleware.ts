import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError } from "./errorHandler.js";
import type { JwtPayload } from "../types/auth.js";

export function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    next(new AppError("Access token required", 401));
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_ACCESS_SECRET!,
    );

    req.user = decoded as JwtPayload;

    next();
  } catch {
    next(new AppError("Invalid or expired access token", 401));
  }
}
import crypto from "node:crypto";

import jwt from "jsonwebtoken";

import type {
  RefreshTokenPayload,
} from "../types/auth.js";

export function generateAccessToken(
  userId: number,
  role: "admin" | "member",
) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_ACCESS_SECRET!,
    { expiresIn: "15m" },
  );
}

export function generateRefreshToken(
  userId: number,
) {
  const jti = crypto.randomUUID();

  const token = jwt.sign(
    { userId, jti },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" },
  );

  return {
    token,
    jti,
  };
}

export function verifyRefreshToken(
  token: string,
): RefreshTokenPayload {
  return jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET!,
  ) as RefreshTokenPayload;
}
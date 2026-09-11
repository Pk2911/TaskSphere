import bcrypt from "bcrypt";

import {
  createUser,
  getUserByEmail,
  getUserById,
  deleteUser,
  getAllUsers,
} from "../repositories/userRepository.js";

import {
  createRefreshToken,
  getRefreshTokenByJti,
  revokeRefreshToken,
} from "../repositories/refreshTokenRepository.js";

import { AppError } from "../middleware/errorHandler.js";

import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

export async function registerUser(email: string, password: string) {
  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    throw new AppError("User already exists", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await createUser({
    email,
    passwordHash,
    role: "member",
  });

  return user;
}

export async function loginUser(email: string, password: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash,
  );

  if (!passwordMatches) {
    throw new AppError("Invalid email or password", 401);
  }

  const accessToken = generateAccessToken(user.id, user.role);

  const { token: refreshToken, jti } = generateRefreshToken(user.id);

  await createRefreshToken({
    jti,
    userId: user.id,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
    revoked: false,
  });

  return {
    user,
    accessToken,
    refreshToken,
  };
}

export async function refreshAccessToken(refreshToken: string) {
  try {
    const { userId, jti } = verifyRefreshToken(refreshToken);

    const storedToken = await getRefreshTokenByJti(jti);

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.userId !== userId ||
      storedToken.expiresAt < Date.now()
    ) {
      throw new AppError("Invalid refresh token", 401);
    }

    await revokeRefreshToken(jti);

    const user = await getUserById(userId);

    if (!user) {
      throw new AppError("Invalid refresh token", 401);
    }

    const accessToken = generateAccessToken(user.id, user.role);

    const {
      token: newRefreshToken,
      jti: newJti,
    } = generateRefreshToken(user.id);

    await createRefreshToken({
      jti: newJti,
      userId: user.id,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
      revoked: false,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid refresh token", 401);
  }
}

export async function logoutUser(refreshToken: string) {
  try {
    const { userId, jti } = verifyRefreshToken(refreshToken);

    const storedToken = await getRefreshTokenByJti(jti);

    if (
      !storedToken ||
      storedToken.revoked ||
      storedToken.userId !== userId ||
      storedToken.expiresAt < Date.now()
    ) {
      throw new AppError("Invalid refresh token", 401);
    }

    await revokeRefreshToken(jti);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError("Invalid refresh token", 401);
  }
}

export async function removeUser(id: number) {
  const user = await deleteUser(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
}

export async function listUsers() {
  return await getAllUsers();
}
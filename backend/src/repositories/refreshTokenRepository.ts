import { prisma } from "../lib/prisma.js";

export interface StoredRefreshToken {
  jti: string;
  userId: number;
  expiresAt: number;
  revoked: boolean;
}

export async function createRefreshToken(
  token: StoredRefreshToken,
): Promise<StoredRefreshToken> {
  const savedToken = await prisma.refreshToken.create({
    data: {
      jti: token.jti,
      userId: token.userId,
      expiresAt: new Date(token.expiresAt),
      revoked: token.revoked,
    },
  });

  return {
    jti: savedToken.jti,
    userId: savedToken.userId,
    expiresAt: savedToken.expiresAt.getTime(),
    revoked: savedToken.revoked,
  };
}

export async function getRefreshTokenByJti(
  jti: string,
): Promise<StoredRefreshToken | undefined> {
  const token = await prisma.refreshToken.findUnique({
    where: { jti },
  });

  if (!token) {
    return undefined;
  }

  return {
    jti: token.jti,
    userId: token.userId,
    expiresAt: token.expiresAt.getTime(),
    revoked: token.revoked,
  };
}

export async function revokeRefreshToken(
  jti: string,
): Promise<boolean> {
  const token = await prisma.refreshToken.findUnique({
    where: { jti },
  });

  if (!token) {
    return false;
  }

  await prisma.refreshToken.update({
    where: { jti },
    data: {
      revoked: true,
    },
  });

  return true;
}
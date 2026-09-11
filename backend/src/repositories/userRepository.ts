import { prisma } from "../lib/prisma.js";
import type { User } from "../types/user.js";

export async function getUserByEmail(
  email: string,
): Promise<User | undefined> {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  return user ?? undefined;
}

export async function getUserById(
  id: number,
): Promise<User | undefined> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user ?? undefined;
}

export async function createUser(
  user: Omit<User, "id">,
): Promise<User> {
  return await prisma.user.create({
    data: {
      email: user.email,
      passwordHash: user.passwordHash,
      role: user.role,
    },
  });
}

export async function deleteUser(
  id: number,
): Promise<User | undefined> {
  try {
    return await prisma.user.delete({
      where: { id },
    });
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "Record to delete does not exist",
      )
    ) {
      return undefined;
    }

    throw error;
  }
}

export async function getAllUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      role: true,
    },
    orderBy: {
      id: "asc",
    },
  });
}


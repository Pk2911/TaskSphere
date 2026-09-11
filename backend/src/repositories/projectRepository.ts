import { prisma } from "../lib/prisma.js";

export function createProject(data: {
  name: string;
  description?: string;
  ownerId: number;
}) {
  return prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
    },
  });
}

export function getProjectsByOwner(
  ownerId: number,
) {
  return prisma.project.findMany({
    where: {
      ownerId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export function getProjectById(
  id: number,
  ownerId: number,
) {
  return prisma.project.findFirst({
    where: {
      id,
      ownerId,
    },
  });
}
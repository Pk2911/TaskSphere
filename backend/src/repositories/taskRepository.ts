import { prisma } from "../lib/prisma.js";

export function getAllTasks() {
  return prisma.task.findMany();
}

export function getTaskById(id: number) {
  return prisma.task.findUnique({
    where: { id },
  });
}

export function createTask(data: {
  title: string;
  description: string;
  dueDate?: string;
  projectId?: number;
}) {
  return prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      projectId: data.projectId,
    },
  });
}

export function updateTask(
  id: number,
  data: {
    title?: string;
    description?: string;
    status?: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate?: string;
    userId?: number;
    projectId?: number;
  },
) {
  return prisma.task.update({
    where: { id },
    data: {
      title: data.title,
      description: data.description,
      status: data.status,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      userId: data.userId,
      projectId: data.projectId,
    },
  });
}

export function deleteTask(id: number) {
  return prisma.task.delete({
    where: { id },
  });
}
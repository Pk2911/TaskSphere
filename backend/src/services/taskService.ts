import { prisma } from "../lib/prisma.js";

import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../repositories/taskRepository.js";

export async function listTasks() {
  return await getAllTasks();
}

export async function findTask(id: number) {
  return await getTaskById(id);
}

export async function addTask(
  title: string,
  description: string,
  dueDate?: string,
  projectId?: number,
) {
  return await createTask({
    title,
    description,
    dueDate,
    projectId,
  });
}

export async function editTask(
  id: number,
  data: Partial<{
    title: string;
    description: string;
    status: "TODO" | "IN_PROGRESS" | "DONE";
    dueDate: string;
    userId: number;
    projectId: number;
  }>,
) {
  return await updateTask(id, data);
}

export async function removeTask(id: number) {
  return await deleteTask(id);
}

export async function assignTask(id: number, userId: number) {
  return await updateTask(id, { userId });
}

export async function moveTaskToDone(
  taskId: number,
  userId: number,
) {
  return await prisma.$transaction(async (tx) => {
    const task = await tx.task.update({
      where: { id: taskId },
      data: {
        status: "DONE",
      },
    });

    await tx.auditLog.create({
      data: {
        action: "TASK_MOVED_TO_DONE",
        taskId,
        userId,
      },
    });

    return task;
  });
}
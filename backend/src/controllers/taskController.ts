import type { Request, Response } from "express";

import {
  listTasks,
  findTask,
  addTask,
  editTask,
  removeTask,
  assignTask,
  moveTaskToDone,
} from "../services/taskService.js";

import { AppError } from "../middleware/errorHandler.js";

export async function getTasks(req: Request, res: Response) {
  const tasks = await listTasks();

  res.json(tasks);
}

export async function getTask(req: Request, res: Response) {
  const id = Number(req.params.id);

  const task = await findTask(id);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.json(task);
}

export async function createTask(req: Request, res: Response) {
  const { title, description, dueDate, projectId } = req.body;

  const task = await addTask(
    title,
    description,
    dueDate,
    projectId,
  );

  res.status(201).json(task);
}

export async function updateTask(req: Request, res: Response) {
  const id = Number(req.params.id);

  const task = await editTask(id, req.body);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.json(task);
}

export async function deleteTask(req: Request, res: Response) {
  const id = Number(req.params.id);

  try {
    await removeTask(id);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes(
        "Record to delete does not exist",
      )
    ) {
      throw new AppError("Task not found", 404);
    }

    throw error;
  }

  res.status(204).send();
}

export async function assignTaskToUser(
  req: Request,
  res: Response,
) {
  const taskId = Number(req.params.id);
  const userId = Number(req.body.userId);

  const task = await assignTask(taskId, userId);

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  res.json(task);
}

export async function moveTaskToDoneController(
  req: Request,
  res: Response,
) {
  const taskId = Number(req.params.id);
  const userId = req.user!.userId;

  const task = await moveTaskToDone(taskId, userId);

  res.json(task);
}
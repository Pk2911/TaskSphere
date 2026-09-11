import type { Request, Response } from "express";

import {
  addProject,
  listProjects,
  findProject,
} from "../services/projectService.js";

import { AppError } from "../middleware/errorHandler.js";

export async function createProject(
  req: Request,
  res: Response,
) {
  const { name, description } = req.body;

  const ownerId = req.user!.userId;

  const project = await addProject(
    name,
    description,
    ownerId,
  );

  res.status(201).json(project);
}

export async function getProjects(
  req: Request,
  res: Response,
) {
  const ownerId = req.user!.userId;

  const projects = await listProjects(ownerId);

  res.json(projects);
}

export async function getProject(
  req: Request,
  res: Response,
) {
  const projectId = Number(req.params.id);
  const ownerId = req.user!.userId;

  const project = await findProject(
    projectId,
    ownerId,
  );

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  res.json(project);
}
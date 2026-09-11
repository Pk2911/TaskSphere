import type { Request, Response } from "express";

import { addTaskAttachment } from "../services/taskAttachmentService.js";
import { AppError } from "../middleware/errorHandler.js";

export async function uploadTaskAttachmentController(
  req: Request,
  res: Response,
) {
  const taskId = Number(req.params.id);

  if (!req.file) {
    throw new AppError("No file uploaded", 400);
  }

  const attachment = await addTaskAttachment({
    taskId,
    fileName: req.file.originalname,
    storedName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: `/uploads/${req.file.filename}`,
  });

  res.status(201).json(attachment);
}
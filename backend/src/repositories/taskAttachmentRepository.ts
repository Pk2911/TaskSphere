import { prisma } from "../lib/prisma.js";

export function createTaskAttachment(data: {
  taskId: number;
  fileName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
}) {
  return prisma.taskAttachment.create({
    data,
  });
}
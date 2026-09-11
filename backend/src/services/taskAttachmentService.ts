import { createTaskAttachment } from "../repositories/taskAttachmentRepository.js";

export async function addTaskAttachment(data: {
  taskId: number;
  fileName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
}) {
  return await createTaskAttachment(data);
}
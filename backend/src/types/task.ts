export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  userId?: number;
  projectId?: number;
  dueDate?: string;
}
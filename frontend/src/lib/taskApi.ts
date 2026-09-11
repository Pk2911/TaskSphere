const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE";

export type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  dueDate: string | null;
  userId: number | null;
  projectId: number | null;
  createdAt: string;
  updatedAt: string;
};

export type User = {
  id: number;
  email: string;
  role: "admin" | "member";
};

export type CreateTaskData = {
  title: string;
  description: string;
  dueDate?: string;
  projectId?: number;
};

export type UpdateTaskData = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
  userId?: number;
  projectId?: number;
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText || `Request failed with status ${response.status}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getTasks(): Promise<Task[]> {
  return apiRequest<Task[]>("/tasks");
}

export async function getUsers(): Promise<User[]> {
  return apiRequest<User[]>("/auth/users");
}

export async function createTask(
  task: CreateTaskData,
): Promise<Task> {
  return apiRequest<Task>("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export async function updateTask(
  taskId: number,
  task: UpdateTaskData,
): Promise<Task> {
  return apiRequest<Task>(`/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(task),
  });
}

export async function assignTask(
  taskId: number,
  userId: number,
): Promise<Task> {
  return apiRequest<Task>(`/tasks/${taskId}/assign`, {
    method: "PATCH",
    body: JSON.stringify({ userId }),
  });
}

export async function deleteTask(
  taskId: number,
): Promise<void> {
  return apiRequest<void>(`/tasks/${taskId}`, {
    method: "DELETE",
  });
}

export async function markTaskDone(
  taskId: number,
): Promise<Task> {
  return apiRequest<Task>(`/tasks/${taskId}/done`, {
    method: "PATCH",
  });
}
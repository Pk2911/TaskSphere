const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000";

export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "DONE";

export type TaskPriority =
  | "LOW"
  | "MEDIUM"
  | "HIGH";

export type Task = {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
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

export type Project = {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: string;
};

export type CreateProjectData = {
  name: string;
  description?: string;
};

export type CreateTaskData = {
  title: string;
  description: string;
  dueDate?: string;
  priority?: TaskPriority;
  userId?: number;
  projectId?: number;
};

export type UpdateTaskData = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;
  priority?: TaskPriority;
  userId?: number;
  projectId?: number;
};

export type TaskAttachment = {
  id: number;
  fileName: string;
  storedName: string;
  mimeType: string;
  size: number;
  path: string;
  taskId: number;
  createdAt: string;
};

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
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
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Request failed with status ${response.status}`,
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

export async function getProjects(): Promise<Project[]> {
  return apiRequest<Project[]>("/projects");
}

export async function createProject(
  project: CreateProjectData,
): Promise<Project> {
  return apiRequest<Project>("/projects", {
    method: "POST",
    body: JSON.stringify(project),
  });
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
  return apiRequest<Task>(
    `/tasks/${taskId}/assign`,
    {
      method: "PATCH",
      body: JSON.stringify({ userId }),
    },
  );
}

export async function deleteTask(
  taskId: number,
): Promise<void> {
  return apiRequest<void>(
    `/tasks/${taskId}`,
    {
      method: "DELETE",
    },
  );
}

export async function markTaskDone(
  taskId: number,
): Promise<Task> {
  return apiRequest<Task>(
    `/tasks/${taskId}/done`,
    {
      method: "PATCH",
    },
  );
}

export async function uploadTaskAttachment(
  taskId: number,
  file: File,
): Promise<TaskAttachment> {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("accessToken")
      : null;

  const formData = new FormData();

  formData.append("file", file);

  const response = await fetch(
    `${API_URL}/tasks/${taskId}/attachments`,
    {
      method: "POST",
      headers: {
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      },
      body: formData,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      errorText ||
        `Request failed with status ${response.status}`,
    );
  }

  return response.json() as Promise<TaskAttachment>;
}
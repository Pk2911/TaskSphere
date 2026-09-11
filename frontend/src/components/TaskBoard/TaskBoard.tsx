"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import Modal from "@/components/Modal/Modal";
import TaskForm from "@/components/TaskForm/TaskForm";
import ProjectForm from "@/components/ProjectForm/ProjectForm";

import {
  assignTask,
  createProject,
  createTask,
  deleteTask,
  getProjects,
  getTasks,
  getUsers,
  markTaskDone,
  updateTask,
  uploadTaskAttachment,
  type Project,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/lib/taskApi";

const TASKS_PER_PAGE = 5;

export default function TaskBoard() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"ALL" | TaskStatus>("ALL");
  const [assigneeFilter, setAssigneeFilter] =
    useState<number | "ALL">("ALL");

  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);

  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);

  const [isAssignModalOpen, setIsAssignModalOpen] =
    useState(false);

  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [selectedProject, setSelectedProject] =
    useState<Project | null>(null);

  const [error, setError] = useState("");

  const {
    data: tasks = [],
    isLoading: tasksLoading,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const {
    data: users = [],
    isLoading: usersLoading,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const {
    data: projects = [],
    isLoading: projectsLoading,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects,
  });

  const createTaskMutation = useMutation({
    mutationFn: async ({
      data,
      attachment,
    }: {
      data: {
        title: string;
        description: string;
        dueDate?: string;
        priority?: TaskPriority;
        userId?: number;
        projectId?: number;
      };
      attachment: File | null;
    }) => {
      const task = await createTask(data);

      if (attachment) {
        await uploadTaskAttachment(
          task.id,
          attachment,
        );
      }

      return task;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      setIsCreateModalOpen(false);
      setError("");
    },

    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({
      taskId,
      data,
      attachment,
    }: {
      taskId: number;
      data: {
        title?: string;
        description?: string;
        status?: TaskStatus;
        dueDate?: string;
        priority?: TaskPriority;
        userId?: number;
        projectId?: number;
      };
      attachment: File | null;
    }) => {
      const task = await updateTask(taskId, data);

      if (attachment) {
        await uploadTaskAttachment(
          task.id,
          attachment,
        );
      }

      return task;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      setIsEditModalOpen(false);
      setSelectedTask(null);
      setError("");
    },

    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: ({
      name,
      description,
    }: {
      name: string;
      description: string;
    }) =>
      createProject({
        name,
        description: description || undefined,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects"],
      });

      setIsCreateProjectModalOpen(false);
      setError("");
    },

    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const assignTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      userId,
    }: {
      taskId: number;
      userId: number;
    }) => assignTask(taskId, userId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      setIsAssignModalOpen(false);
      setSelectedTask(null);
      setError("");
    },

    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      setError("");
    },

    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const markDoneMutation = useMutation({
    mutationFn: markTaskDone,

    onMutate: async (taskId) => {
      await queryClient.cancelQueries({
        queryKey: ["tasks"],
      });

      const previousTasks =
        queryClient.getQueryData<Task[]>([
          "tasks",
        ]);

      queryClient.setQueryData<Task[]>(
        ["tasks"],
        (old = []) =>
          old.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: "DONE",
                }
              : task,
          ),
      );

      return { previousTasks };
    },

    onError: (_error, _taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks"],
          context.previousTasks,
        );
      }

      setError("Failed to mark task as done.");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  const filteredTasks = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !normalizedSearch ||
        task.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        task.description
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" ||
        task.status === statusFilter;

      const matchesAssignee =
        assigneeFilter === "ALL" ||
        task.userId === assigneeFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesAssignee
      );
    });
  }, [
    tasks,
    search,
    statusFilter,
    assigneeFilter,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredTasks.length / TASKS_PER_PAGE,
    ),
  );

  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * TASKS_PER_PAGE,
    currentPage * TASKS_PER_PAGE,
  );

  const getUserEmail = (userId: number | null) => {
    if (!userId) {
      return "Unassigned";
    }

    return (
      users.find((user) => user.id === userId)
        ?.email ?? "Unknown user"
    );
  };

  const getProjectName = (
    projectId: number | null,
  ) => {
    if (!projectId) {
      return "No project";
    }

    return (
      projects.find(
        (project) => project.id === projectId,
      )?.name ?? `Project #${projectId}`
    );
  };

  const handleCreateTask = (
    data: Parameters<
      NonNullable<
        React.ComponentProps<typeof TaskForm>["onSubmit"]
      >
    >[0],
    attachment: File | null,
  ) => {
    createTaskMutation.mutate({
      data,
      attachment,
    });
  };

  const handleUpdateTask = (
    data: Parameters<
      NonNullable<
        React.ComponentProps<typeof TaskForm>["onSubmit"]
      >
    >[0],
    attachment: File | null,
  ) => {
    if (!selectedTask) {
      return;
    }

    updateTaskMutation.mutate({
      taskId: selectedTask.id,
      data,
      attachment,
    });
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setError("");
    setIsEditModalOpen(true);
  };

  const openAssignModal = (task: Task) => {
    setSelectedTask(task);
    setError("");
    setIsAssignModalOpen(true);
  };

  if (
    tasksLoading ||
    usersLoading ||
    projectsLoading
  ) {
    return (
      <main className="p-6">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Task Board
          </h1>

          <p className="text-sm text-gray-600">
            Manage your tasks and projects.
          </p>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={() => {
              setError("");
              setIsCreateProjectModalOpen(true);
            }}
          >
            Create Project
          </Button>

          <Button
            type="button"
            onClick={() => {
              setError("");
              setIsCreateModalOpen(true);
            }}
          >
            Create Task
          </Button>
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <input
          type="search"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search tasks..."
          aria-label="Search tasks"
          className="rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        />

        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(
              event.target.value as
                | "ALL"
                | TaskStatus,
            );
            setCurrentPage(1);
          }}
          aria-label="Filter by status"
          className="rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        >
          <option value="ALL">All statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">
            In Progress
          </option>
          <option value="DONE">Done</option>
        </select>

        <select
          value={assigneeFilter}
          onChange={(event) => {
            const value = event.target.value;

            setAssigneeFilter(
              value === "ALL"
                ? "ALL"
                : Number(value),
            );

            setCurrentPage(1);
          }}
          aria-label="Filter by assignee"
          className="rounded-md border border-gray-300 px-3 py-2 text-gray-900"
        >
          <option value="ALL">
            All assignees
          </option>

          {users.map((user) => (
            <option
              key={user.id}
              value={user.id}
            >
              {user.email}
            </option>
          ))}
        </select>
      </div>

      {projects.length > 0 && (
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Projects
          </h2>

          <div className="flex flex-wrap gap-2">
            {projects.map((project) => (
              <span
                key={project.id}
                className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
              >
                {project.name}
              </span>
            ))}
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {paginatedTasks.length === 0 ? (
          <Card>
            <p className="text-gray-600">
              No tasks found.
            </p>
          </Card>
        ) : (
          paginatedTasks.map((task) => (
            <Card key={task.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {task.title}
                  </h2>

                  <p className="text-gray-600">
                    {task.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="rounded bg-gray-100 px-2 py-1">
                      {task.status}
                    </span>

                    <span className="rounded bg-gray-100 px-2 py-1">
                      Priority: {task.priority}
                    </span>

                    <span className="rounded bg-gray-100 px-2 py-1">
                      Assignee:{" "}
                      {getUserEmail(task.userId)}
                    </span>

                    <span className="rounded bg-gray-100 px-2 py-1">
                      Project:{" "}
                      {getProjectName(
                        task.projectId,
                      )}
                    </span>

                    {task.dueDate && (
                      <span className="rounded bg-gray-100 px-2 py-1">
                        Due:{" "}
                        {new Date(
                          task.dueDate,
                        ).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {task.status !== "DONE" && (
                    <Button
                      type="button"
                      onClick={() =>
                        markDoneMutation.mutate(
                          task.id,
                        )
                      }
                      loading={
                        markDoneMutation.isPending &&
                        markDoneMutation.variables ===
                          task.id
                      }
                    >
                      Mark Done
                    </Button>
                  )}

                  <Button
                    type="button"
                    onClick={() =>
                      openEditModal(task)
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    type="button"
                    onClick={() =>
                      openAssignModal(task)
                    }
                  >
                    Assign
                  </Button>

                  <Button
                    type="button"
                    onClick={() =>
                      deleteTaskMutation.mutate(
                        task.id,
                      )
                    }
                    loading={
                      deleteTaskMutation.isPending &&
                      deleteTaskMutation.variables ===
                        task.id
                    }
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="flex items-center justify-center gap-4">
        <Button
          type="button"
          disabled={currentPage === 1}
          onClick={() =>
            setCurrentPage((page) =>
              Math.max(1, page - 1),
            )
          }
        >
          Previous
        </Button>

        <span className="text-sm text-gray-600">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          type="button"
          disabled={currentPage === totalPages}
          onClick={() =>
            setCurrentPage((page) =>
              Math.min(totalPages, page + 1),
            )
          }
        >
          Next
        </Button>
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() =>
          setIsCreateModalOpen(false)
        }
        title="Create Task"
      >
        <TaskForm
          users={users}
          projects={projects}
          onSubmit={handleCreateTask}
          isSubmitting={
            createTaskMutation.isPending
          }
        />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        title="Edit Task"
      >
        {selectedTask && (
          <div className="space-y-5">
            <div>
              <label
                htmlFor="edit-task-status"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Status
              </label>

              <select
                id="edit-task-status"
                defaultValue={selectedTask.status}
                onChange={(event) => {
                  setSelectedTask({
                    ...selectedTask,
                    status:
                      event.target.value as TaskStatus,
                  });
                }}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
              >
                <option value="TODO">
                  To Do
                </option>
                <option value="IN_PROGRESS">
                  In Progress
                </option>
                <option value="DONE">
                  Done
                </option>
              </select>
            </div>

            <TaskForm
              users={users}
              projects={projects}
              initialData={{
                title: selectedTask.title,
                description:
                  selectedTask.description,
                dueDate:
                  selectedTask.dueDate ?? undefined,
                priority:
                  selectedTask.priority,
                userId:
                  selectedTask.userId ?? undefined,
                projectId:
                  selectedTask.projectId ??
                  undefined,
              }}
              isEditing
              onSubmit={handleUpdateTask}
              isSubmitting={
                updateTaskMutation.isPending
              }
            />
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedTask(null);
        }}
        title="Assign Task"
      >
        {selectedTask && (
          <div className="space-y-4">
            <label
              htmlFor="assign-user"
              className="block text-sm font-medium text-gray-700"
            >
              Assignee
            </label>

            <select
              id="assign-user"
              defaultValue={
                selectedTask.userId ?? ""
              }
              onChange={(event) => {
                const userId = Number(
                  event.target.value,
                );

                if (userId) {
                  assignTaskMutation.mutate({
                    taskId: selectedTask.id,
                    userId,
                  });
                }
              }}
              disabled={
                assignTaskMutation.isPending
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900"
            >
              <option value="">
                Select a user
              </option>

              {users.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.email}
                </option>
              ))}
            </select>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={isCreateProjectModalOpen}
        onClose={() =>
          setIsCreateProjectModalOpen(false)
        }
        title="Create Project"
      >
        <ProjectForm
          onSubmit={(name, description) =>
            createProjectMutation.mutate({
              name,
              description,
            })
          }
          isSubmitting={
            createProjectMutation.isPending
          }
        />
      </Modal>
    </main>
  );
}
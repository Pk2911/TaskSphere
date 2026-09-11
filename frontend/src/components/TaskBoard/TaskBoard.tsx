"use client";

import { useEffect, useMemo, useState } from "react";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import Modal from "@/components/Modal/Modal";

import {
  assignTask,
  createTask,
  deleteTask,
  getTasks,
  getUsers,
  markTaskDone,
  updateTask,
  type Task,
  type TaskStatus,
  type UpdateTaskData,
  type User,
} from "@/lib/taskApi";

type StatusFilter = "ALL" | TaskStatus;

export default function TaskBoard() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState("ALL");

  const [currentPage, setCurrentPage] = useState(1);

  const tasksPerPage = 5;

  const [isCreateModalOpen, setIsCreateModalOpen] =
    useState(false);
  const [isEditModalOpen, setIsEditModalOpen] =
    useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] =
    useState<TaskStatus>("TODO");

  const [selectedUserId, setSelectedUserId] =
    useState("");

  const [failedMarkDoneTaskId, setFailedMarkDoneTaskId] =
    useState<number | null>(null);

  const {
    data: tasks,
    isPending: tasksLoading,
    isError: tasksError,
    error: taskError,
  } = useQuery<Task[], Error>({
    queryKey: ["tasks"],
    queryFn: getTasks,
  });

  const {
    data: users,
    isPending: usersLoading,
  } = useQuery<User[], Error>({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      setIsCreateModalOpen(false);
      setTitle("");
      setDescription("");
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: number;
      data: UpdateTaskData;
    }) => updateTask(taskId, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });

      setIsEditModalOpen(false);
      setSelectedTask(null);
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
      setSelectedUserId("");
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  const markDoneMutation = useMutation({
    mutationFn: markTaskDone,

    onMutate: async (taskId) => {
      setFailedMarkDoneTaskId(null);

      await queryClient.cancelQueries({
        queryKey: ["tasks"],
      });

      const previousTasks =
        queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(
        ["tasks"],
        (currentTasks) =>
          currentTasks?.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: "DONE",
                }
              : task,
          ),
      );

      return {
        previousTasks,
      };
    },

    onError: (_error, taskId, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          ["tasks"],
          context.previousTasks,
        );
      }

      setFailedMarkDoneTaskId(taskId);
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tasks"],
      });
    },
  });

  const filteredTasks = useMemo(() => {
    if (!tasks) {
      return [];
    }

    const searchTerm = search.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !searchTerm ||
        task.title.toLowerCase().includes(searchTerm);

      const matchesStatus =
        statusFilter === "ALL" ||
        task.status === statusFilter;

      const matchesAssignee =
        assigneeFilter === "ALL" ||
        (assigneeFilter === "UNASSIGNED"
          ? task.userId === null
          : task.userId === Number(assigneeFilter));

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
      filteredTasks.length / tasksPerPage,
    ),
  );

  useEffect(() => {
  if (currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
}, [currentPage, totalPages]);

  const paginatedTasks = useMemo(() => {
    const startIndex =
      (currentPage - 1) * tasksPerPage;

    const endIndex =
      startIndex + tasksPerPage;

    return filteredTasks.slice(
      startIndex,
      endIndex,
    );
  }, [filteredTasks, currentPage]);

  const handleSearchChange = (
    value: string,
  ) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (
    value: StatusFilter,
  ) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleAssigneeFilterChange = (
    value: string,
  ) => {
    setAssigneeFilter(value);
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((page) =>
      Math.max(1, page - 1),
    );
  };

  const handleNextPage = () => {
    setCurrentPage((page) =>
      Math.min(totalPages, page + 1),
    );
  };

  const openCreateModal = () => {
    setTitle("");
    setDescription("");
    setStatus("TODO");
    setIsCreateModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setTitle(task.title);
    setDescription(task.description);
    setStatus(task.status);
    setIsEditModalOpen(true);
  };

  const openAssignModal = (task: Task) => {
    setSelectedTask(task);
    setSelectedUserId(
      task.userId !== null
        ? String(task.userId)
        : "",
    );
    setIsAssignModalOpen(true);
  };

  const handleCreateTask = () => {
    if (!title.trim() || !description.trim()) {
      return;
    }

    createTaskMutation.mutate({
      title: title.trim(),
      description: description.trim(),
    });
  };

  const handleUpdateTask = () => {
    if (!selectedTask) {
      return;
    }

    if (!title.trim() || !description.trim()) {
      return;
    }

    updateTaskMutation.mutate({
      taskId: selectedTask.id,
      data: {
        title: title.trim(),
        description: description.trim(),
        status,
      },
    });
  };

  const handleAssignTask = () => {
    if (!selectedTask || !selectedUserId) {
      return;
    }

    assignTaskMutation.mutate({
      taskId: selectedTask.id,
      userId: Number(selectedUserId),
    });
  };

  const handleDeleteTask = (taskId: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    deleteTaskMutation.mutate(taskId);
  };

  const handleMarkDone = (taskId: number) => {
    markDoneMutation.mutate(taskId);
  };

  if (tasksLoading) {
    return (
      <Card>
        <p className="text-sm text-gray-500">
          Loading tasks...
        </p>
      </Card>
    );
  }

  if (tasksError) {
    return (
      <Card>
        <p className="text-sm font-medium text-red-600">
          Failed to load tasks.
        </p>

        <p className="mt-1 text-sm text-gray-500">
          {taskError.message}
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Tasks
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Showing {paginatedTasks.length} of{" "}
              {filteredTasks.length} task
              {filteredTasks.length === 1
                ? ""
                : "s"}
            </p>
          </div>

          <Button onClick={openCreateModal}>
            Create Task
          </Button>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="task-search"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Search tasks
            </label>

            <input
              id="task-search"
              type="search"
              value={search}
              onChange={(event) =>
                handleSearchChange(
                  event.target.value,
                )
              }
              placeholder="Search by title..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="status-filter"
              value={statusFilter}
              onChange={(event) =>
                handleStatusFilterChange(
                  event.target.value as StatusFilter,
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All statuses
              </option>
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">
                IN PROGRESS
              </option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="assignee-filter"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Assignee
            </label>

            <select
              id="assignee-filter"
              value={assigneeFilter}
              onChange={(event) =>
                handleAssigneeFilterChange(
                  event.target.value,
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
            >
              <option value="ALL">
                All assignees
              </option>

              <option value="UNASSIGNED">
                Unassigned
              </option>

              {users?.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.email}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-sm font-medium text-gray-700">
              No tasks found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {paginatedTasks.map((task) => (
                <div
                  key={task.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {task.title}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {task.description}
                      </p>
                    </div>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                      {task.status}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-gray-500">
                    Assignee:{" "}
                    {task.userId !== null
                      ? users?.find(
                          (user) =>
                            user.id === task.userId,
                        )?.email ??
                        `User ${task.userId}`
                      : "Unassigned"}
                  </div>

                  {failedMarkDoneTaskId ===
                    task.id && (
                    <p className="mt-3 text-sm text-red-600">
                      Failed to mark task as done.
                      Please try again.
                    </p>
                  )}

                  {deleteTaskMutation.isError &&
                    deleteTaskMutation.variables ===
                      task.id && (
                      <p className="mt-3 text-sm text-red-600">
                        Failed to delete task.
                      </p>
                    )}

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() =>
                        openEditModal(task)
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() =>
                        openAssignModal(task)
                      }
                    >
                      Assign
                    </Button>

                    {task.status !== "DONE" && (
                      <Button
                        onClick={() =>
                          handleMarkDone(task.id)
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
                      variant="danger"
                      onClick={() =>
                        handleDeleteTask(task.id)
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
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
              <Button
                variant="secondary"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                ← Previous
              </Button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="secondary"
                onClick={handleNextPage}
                disabled={
                  currentPage === totalPages
                }
              >
                Next →
              </Button>
            </div>
          </>
        )}
      </Card>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() =>
          setIsCreateModalOpen(false)
        }
        title="Create Task"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="create-title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Title
            </label>

            <input
              id="create-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="create-description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="create-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              rows={4}
            />
          </div>

          {createTaskMutation.isError && (
            <p className="text-sm text-red-600">
              Failed to create task.
            </p>
          )}

          <Button
            onClick={handleCreateTask}
            loading={createTaskMutation.isPending}
          >
            Create
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedTask(null);
        }}
        title="Edit Task"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="edit-title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Title
            </label>

            <input
              id="edit-title"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </div>

          <div>
            <label
              htmlFor="edit-description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="edit-description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
              rows={4}
            />
          </div>

          <div>
            <label
              htmlFor="edit-status"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Status
            </label>

            <select
              id="edit-status"
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as TaskStatus,
                )
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">
                IN PROGRESS
              </option>
              <option value="DONE">DONE</option>
            </select>
          </div>

          {updateTaskMutation.isError && (
            <p className="text-sm text-red-600">
              Failed to update task.
            </p>
          )}

          <Button
            onClick={handleUpdateTask}
            loading={updateTaskMutation.isPending}
          >
            Save Changes
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false);
          setSelectedTask(null);
        }}
        title="Assign Task"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="assign-user"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              User
            </label>

            <select
              id="assign-user"
              value={selectedUserId}
              onChange={(event) =>
                setSelectedUserId(event.target.value)
              }
              disabled={usersLoading}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="">
                Select a user
              </option>

              {users?.map((user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.email}
                </option>
              ))}
            </select>
          </div>

          {assignTaskMutation.isError && (
            <p className="text-sm text-red-600">
              Failed to assign task.
            </p>
          )}

          <Button
            onClick={handleAssignTask}
            loading={assignTaskMutation.isPending}
          >
            Assign
          </Button>
        </div>
      </Modal>
    </>
  );
}
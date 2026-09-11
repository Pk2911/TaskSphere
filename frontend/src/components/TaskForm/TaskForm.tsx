"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  taskSchema,
  type TaskFormData,
} from "@tasksphere/shared";

import Button from "@/components/Button/Button";

type TaskFormProps = {
  users: {
    id: number;
    email: string;
  }[];

  projects: {
    id: number;
    name: string;
  }[];

  initialData?: Partial<TaskFormData>;

  isEditing?: boolean;

  onSubmit: (
    data: TaskFormData,
    attachment: File | null,
  ) => void;

  isSubmitting?: boolean;
};

type TaskFormInput = {
  title: string;
  description: string;
  userId?: number;
  dueDate?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  projectId?: number;
};

export default function TaskForm({
  users,
  projects,
  initialData,
  isEditing = false,
  onSubmit,
  isSubmitting = false,
}: TaskFormProps) {
  const [step, setStep] = useState(1);
  const [attachment, setAttachment] =
    useState<File | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm<
    TaskFormInput,
    unknown,
    TaskFormData
  >({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description:
        initialData?.description ?? "",
      userId: initialData?.userId,
      dueDate: initialData?.dueDate ?? "",
      priority:
        initialData?.priority ?? "MEDIUM",
      projectId: initialData?.projectId,
    },
  });

  const values = watch();

  const selectedUser = users.find(
    (user) => user.id === values.userId,
  );

  const selectedProject = projects.find(
    (project) =>
      project.id === values.projectId,
  );

  const handleNext = async () => {
    let fields: (
      | "title"
      | "description"
      | "userId"
      | "dueDate"
      | "priority"
      | "projectId"
    )[] = [];

    if (step === 1) {
      fields = [
        "title",
        "description",
        "projectId",
      ];
    }

    if (step === 2) {
      fields = ["userId"];
    }

    if (step === 3) {
      fields = ["dueDate", "priority"];
    }

    const valid = await trigger(fields);

    if (valid) {
      setStep((current) =>
        Math.min(current + 1, 4),
      );
    }
  };

  const handleBack = () => {
    setStep((current) =>
      Math.max(current - 1, 1),
    );
  };

  const handleFormSubmit = (
    data: TaskFormData,
  ) => {
    onSubmit(data, attachment);
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
              step === item
                ? "bg-blue-600 text-white"
                : step > item
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-600"
            }`}
            aria-current={
              step === item
                ? "step"
                : undefined
            }
          >
            {item}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label
              htmlFor="task-title"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Title
            </label>

            <input
              id="task-title"
              type="text"
              {...register("title")}
              aria-invalid={
                errors.title ? "true" : "false"
              }
              aria-describedby={
                errors.title
                  ? "task-title-error"
                  : undefined
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
              placeholder="Enter task title"
              disabled={isSubmitting}
            />

            {errors.title && (
              <p
                id="task-title-error"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.title.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-description"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Description
            </label>

            <textarea
              id="task-description"
              rows={4}
              {...register("description")}
              aria-invalid={
                errors.description
                  ? "true"
                  : "false"
              }
              aria-describedby={
                errors.description
                  ? "task-description-error"
                  : undefined
              }
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
              placeholder="Describe the task"
              disabled={isSubmitting}
            />

            {errors.description && (
              <p
                id="task-description-error"
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-project"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Project
              <span className="ml-1 text-gray-400">
                (optional)
              </span>
            </label>

            <select
              id="task-project"
              {...register("projectId", {
                setValueAs: (value) =>
                  value === ""
                    ? undefined
                    : Number(value),
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="">
                No project
              </option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
            </select>

            {errors.projectId && (
              <p
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.projectId.message}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label
              htmlFor="task-assignee"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Assignee
              <span className="ml-1 text-gray-400">
                (optional)
              </span>
            </label>

            <select
              id="task-assignee"
              {...register("userId", {
                setValueAs: (value) =>
                  value === ""
                    ? undefined
                    : Number(value),
              })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="">
                Unassigned
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

            {errors.userId && (
              <p
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.userId.message}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label
              htmlFor="task-due-date"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Due Date
              <span className="ml-1 text-gray-400">
                (optional)
              </span>
            </label>

            <input
              id="task-due-date"
              type="datetime-local"
              {...register("dueDate")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
              disabled={isSubmitting}
            />

            {errors.dueDate && (
              <p
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.dueDate.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-priority"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Priority
            </label>

            <select
              id="task-priority"
              {...register("priority")}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
              disabled={isSubmitting}
            >
              <option value="LOW">
                Low
              </option>

              <option value="MEDIUM">
                Medium
              </option>

              <option value="HIGH">
                High
              </option>
            </select>

            {errors.priority && (
              <p
                role="alert"
                className="mt-1 text-sm text-red-600"
              >
                {errors.priority.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="task-attachment"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Attachment
              <span className="ml-1 text-gray-400">
                (optional, max 5 MB)
              </span>
            </label>

            <input
              id="task-attachment"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,.pdf,.txt,.doc,.docx"
              onChange={(event) => {
                const file =
                  event.target.files?.[0] ??
                  null;

                if (
                  file &&
                  file.size >
                    5 * 1024 * 1024
                ) {
                  event.target.value = "";
                  setAttachment(null);
                  return;
                }

                setAttachment(file);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700"
              disabled={isSubmitting}
            />

            {attachment && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {attachment.name}
              </p>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Review Task
          </h2>

          <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-700">
            <p>
              <strong>Title:</strong>{" "}
              {values.title}
            </p>

            <p className="mt-2">
              <strong>Description:</strong>{" "}
              {values.description}
            </p>

            <p className="mt-2">
              <strong>Project:</strong>{" "}
              {selectedProject?.name ??
                "No project"}
            </p>

            <p className="mt-2">
              <strong>Assignee:</strong>{" "}
              {selectedUser?.email ??
                "Unassigned"}
            </p>

            <p className="mt-2">
              <strong>Due Date:</strong>{" "}
              {values.dueDate ||
                "No due date"}
            </p>

            <p className="mt-2">
              <strong>Priority:</strong>{" "}
              {values.priority}
            </p>

            <p className="mt-2">
              <strong>Attachment:</strong>{" "}
              {attachment?.name ??
                "No attachment"}
            </p>
          </div>
        </div>
      )}

      <div className="flex justify-between gap-3">
        <div>
          {step > 1 && (
            <Button
              type="button"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          )}
        </div>

        <div>
          {step < 4 ? (
            <Button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              loading={isSubmitting}
            >
              {isEditing
                ? "Update Task"
                : "Create Task"}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
}
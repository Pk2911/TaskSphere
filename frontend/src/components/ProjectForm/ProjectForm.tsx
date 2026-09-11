"use client";

import { useState } from "react";

import Button from "@/components/Button/Button";

type ProjectFormProps = {
  onSubmit: (
    name: string,
    description: string,
  ) => void;

  isSubmitting?: boolean;
};

export default function ProjectForm({
  onSubmit,
  isSubmitting = false,
}: ProjectFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");

  const [error, setError] = useState("");

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const trimmedName = name.trim();
    const trimmedDescription =
      description.trim();

    if (!trimmedName) {
      setError("Project name is required.");
      return;
    }

    if (trimmedName.length > 100) {
      setError(
        "Project name must be 100 characters or less.",
      );
      return;
    }

    if (trimmedDescription.length > 1000) {
      setError(
        "Description must be 1000 characters or less.",
      );
      return;
    }

    setError("");

    onSubmit(
      trimmedName,
      trimmedDescription,
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="project-name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Project Name
        </label>

        <input
          id="project-name"
          type="text"
          value={name}
          onChange={(event) =>
            setName(event.target.value)
          }
          aria-invalid={error ? "true" : "false"}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
          placeholder="Enter project name"
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label
          htmlFor="project-description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Description
          <span className="ml-1 text-gray-400">
            (optional)
          </span>
        </label>

        <textarea
          id="project-description"
          rows={4}
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-blue-500"
          placeholder="Describe the project"
          disabled={isSubmitting}
        />
      </div>

      {error && (
        <p
          role="alert"
          className="text-sm text-red-600"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        loading={isSubmitting}
      >
        Create Project
      </Button>
    </form>
  );
}
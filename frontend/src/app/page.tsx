"use client";

import { useState } from "react";

import Button from "@/components/Button/Button";
import Card from "@/components/Card/Card";
import Modal from "@/components/Modal/Modal";
import Table from "@/components/Table/Table";

type Task = {
  id: number;
  title: string;
  status: string;
};

const tasks: Task[] = [
  {
    id: 1,
    title: "Learn React",
    status: "DONE",
  },
  {
    id: 2,
    title: "Build Component Library",
    status: "IN_PROGRESS",
  },
  {
    id: 3,
    title: "Learn Next.js",
    status: "TODO",
  },
];

const columns = [
  { key: "id" as keyof Task, label: "ID" },
  { key: "title" as keyof Task, label: "Title" },
  { key: "status" as keyof Task, label: "Status" },
];

export default function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAction, setLastAction] = useState("Nothing yet");

  return (
    <main className="min-h-screen bg-[#111111] px-5 py-8 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 flex flex-col gap-4 border-b border-white/10 pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
              <span className="h-2 w-2 rounded-full bg-green-400" />
              component-library
            </div>

            <h1 className="text-3xl font-semibold tracking-tight">
              UI Components
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Next.js · TypeScript · Tailwind
            </p>
          </div>

          <div className="text-sm text-gray-600">
            v1.0
          </div>
        </header>

        {/* Last action */}
        <div className="mb-10 rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="text-xs uppercase tracking-wider text-gray-600">
            Last action
          </span>

          <p className="mt-1 text-sm text-gray-300">
            {lastAction}
          </p>
        </div>

        {/* Buttons */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Buttons</h2>

            <p className="mt-1 text-sm text-gray-500">
              Variants + loading state
            </p>
          </div>

          <Card>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="primary"
                onClick={() => setLastAction("Primary button clicked")}
              >
                Primary
              </Button>

              <Button
                variant="secondary"
                onClick={() => setLastAction("Secondary button clicked")}
              >
                Secondary
              </Button>

              <Button
                variant="danger"
                onClick={() => setLastAction("Danger button clicked")}
              >
                Danger
              </Button>

              <Button variant="primary" loading>
                Loading
              </Button>
            </div>
          </Card>
        </section>

        {/* Cards */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Cards</h2>

            <p className="mt-1 text-sm text-gray-500">
              Different content, same component
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                Total tasks
              </p>

              <p className="mt-3 text-4xl font-semibold text-gray-900">
                24
              </p>

              <p className="mt-2 text-sm text-gray-500">
                Tasks currently in the system
              </p>
            </Card>

            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Recent task
                  </p>

                  <h3 className="mt-3 text-lg font-semibold text-gray-900">
                    Build Component Library
                  </h3>

                  <p className="mt-2 text-sm text-gray-500">
                    In progress
                  </p>
                </div>

                <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
                  working
                </span>
              </div>

              <div className="mt-5">
                <Button
                  variant="primary"
                  onClick={() => setLastAction("View Task clicked")}
                >
                  View Task
                </Button>
              </div>
            </Card>
          </div>
        </section>

        {/* Table */}
        <section className="mb-10">
          <div className="mb-4">
            <h2 className="text-lg font-medium">Table</h2>

            <p className="mt-1 text-sm text-gray-500">
              Click a column to sort
            </p>
          </div>

          <Card>
            <Table data={tasks} columns={columns} />
          </Card>
        </section>

        {/* Modal */}
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-medium">Modal</h2>

            <p className="mt-1 text-sm text-gray-500">
              Keyboard-friendly dialog
            </p>
          </div>

          <Card>
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Try the modal
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Tab around, then try Escape.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={() => {
                  setLastAction("Modal opened");
                  setIsModalOpen(true);
                }}
              >
                Open Modal
              </Button>
            </div>
          </Card>
        </section>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setLastAction("Modal closed");
            setIsModalOpen(false);
          }}
          title="Test modal"
        >
          <p className="text-gray-600">
            The focus stays inside this dialog while it is open.
          </p>

          <div className="mt-6 flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setLastAction("Cancelled modal");
                setIsModalOpen(false);
              }}
            >
              Cancel
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                setLastAction("Confirmed modal");
                setIsModalOpen(false);
              }}
            >
              Done
            </Button>
          </div>
        </Modal>
      </div>
    </main>
  );
}
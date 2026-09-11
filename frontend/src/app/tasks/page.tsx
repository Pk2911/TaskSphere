import TaskBoard from "@/components/TaskBoard/TaskBoard";

export default function TasksPage() {
  return (
    <main className="min-h-screen bg-[#111111] px-5 py-8 text-white md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8">
          <p className="text-sm text-gray-500">Task Management</p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Task Board
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Manage tasks from the Week 1 API.
          </p>
        </header>

        <TaskBoard />
      </div>
    </main>
  );
}
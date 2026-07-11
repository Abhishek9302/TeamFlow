"use client";

import { useEffect, useState } from "react";
import { apiJSON } from "@/lib/api";
import { TaskList } from "@/components/TaskList";

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<
    {
      id: number;
      title: string;
      completed: boolean;
      due_date?: string | null;
      assignee_name?: string | null;
    }[]
  >([]);

  const fetchTasks = async () => {
    try {
      const data = await apiJSON("/api/me/tasks");
      setTasks(data.tasks || []);
    } catch {
      setTasks([]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const toggleTask = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    await apiJSON(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: !task.completed }),
    });
    fetchTasks();
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-slate-800">My Tasks</h1>
      <TaskList tasks={tasks} onTaskClick={() => {}} onToggle={toggleTask} />
    </div>
  );
}

"use client";

import { TaskRow } from "./TaskRow";

export function TaskList({
  tasks,
  onTaskClick,
  onToggle,
}: {
  tasks: {
    id: number;
    title: string;
    completed: boolean;
    due_date?: string | null;
    assignee_name?: string | null;
  }[];
  onTaskClick: (id: number) => void;
  onToggle: (id: number) => void;
}) {
  if (!tasks.length) return <p className="text-sm text-slate-500">No tasks yet.</p>;
  return (
    <div className="flex flex-col gap-2">
      {tasks.map((t) => (
        <TaskRow key={t.id} task={t} onClick={() => onTaskClick(t.id)} onToggle={() => onToggle(t.id)} />
      ))}
    </div>
  );
}

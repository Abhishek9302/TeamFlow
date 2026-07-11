"use client";

import { AssigneeBadge } from "./AssigneeBadge";

export function TaskRow({
  task,
  onClick,
  onToggle,
}: {
  task: {
    id: number;
    title: string;
    completed: boolean;
    due_date?: string | null;
    assignee_name?: string | null;
  };
  onClick: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg px-4 py-3 hover:shadow-sm transition">
      <input
        type="checkbox"
        checked={task.completed}
        onChange={onToggle}
        className="h-4 w-4 text-indigo-600 rounded border-slate-300"
      />
      <button onClick={onClick} className="flex-1 text-left">
        <span className={`text-sm ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
          {task.title}
        </span>
      </button>
      <div className="flex items-center gap-3">
        {task.due_date ? (
          <span className="text-xs text-slate-500">{task.due_date}</span>
        ) : null}
        <AssigneeBadge name={task.assignee_name} />
      </div>
    </div>
  );
}

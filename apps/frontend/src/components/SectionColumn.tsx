"use client";

import { TaskRow } from "./TaskRow";

export function SectionColumn({
  section,
  tasks,
  onTaskClick,
  onToggle,
}: {
  section: { id: number; name: string };
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
  return (
    <div className="flex-shrink-0 w-72 bg-slate-100 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-700">{section.name}</h4>
        <span className="text-xs text-slate-500">{tasks.length}</span>
      </div>
      <div className="flex flex-col gap-2">
      {tasks.map((t) => (
        <div key={t.id} className="bg-white border border-slate-200 rounded-md px-3 py-2">
          <div className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={t.completed}
              onChange={() => onToggle(t.id)}
              className="mt-0.5 h-4 w-4 text-indigo-600 rounded border-slate-300"
            />
            <button onClick={() => onTaskClick(t.id)} className="flex-1 text-left">
              <span className={`text-sm ${t.completed ? "line-through text-slate-400" : "text-slate-800"}`}>
                {t.title}
              </span>
            </button>
          </div>
          {t.due_date ? <div className="text-xs text-slate-500 mt-1">{t.due_date}</div> : null}
        </div>
      ))}
      </div>
    </div>
  );
}

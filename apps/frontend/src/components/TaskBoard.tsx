"use client";

import { SectionColumn } from "./SectionColumn";

export function TaskBoard({
  sections,
  tasks,
  onTaskClick,
  onToggle,
}: {
  sections: { id: number; name: string }[];
  tasks: {
    id: number;
    title: string;
    completed: boolean;
    section_id?: number | null;
    due_date?: string | null;
    assignee_name?: string | null;
  }[];
  onTaskClick: (id: number) => void;
  onToggle: (id: number) => void;
}) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {sections.map((s) => (
        <SectionColumn
          key={s.id}
          section={s}
          tasks={tasks.filter((t) => t.section_id === s.id)}
          onTaskClick={onTaskClick}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

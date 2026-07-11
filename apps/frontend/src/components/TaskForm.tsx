"use client";

import { useState } from "react";

export function TaskForm({
  sections,
  users,
  initial,
  onSubmit,
  onCancel,
}: {
  sections: { id: number; name: string }[];
  users: { id: number; name: string | null; email: string }[];
  initial?: {
    title?: string;
    description?: string | null;
    section_id?: number | null;
    due_date?: string | null;
    assignee_user_id?: number | null;
    completed?: boolean;
  };
  onSubmit: (data: {
    title: string;
    description: string;
    section_id: number | null;
    due_date: string | null;
    assignee_user_id: number | null;
    completed: boolean;
  }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [sectionId, setSectionId] = useState<string>(String(initial?.section_id || ""));
  const [dueDate, setDueDate] = useState(initial?.due_date || "");
  const [assigneeId, setAssigneeId] = useState<string>(String(initial?.assignee_user_id || ""));
  const [completed, setCompleted] = useState(initial?.completed || false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          title,
          description,
          section_id: sectionId ? Number(sectionId) : null,
          due_date: dueDate || null,
          assignee_user_id: assigneeId ? Number(assigneeId) : null,
          completed,
        });
      }}
      className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col gap-3"
    >
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Task title"
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        rows={3}
        className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      <div className="grid grid-cols-2 gap-3">
        <select
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">No section</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select
          value={assigneeId}
          onChange={(e) => setAssigneeId(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
        >
          <option value="">Unassigned</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name || u.email}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3 items-center">
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="h-4 w-4 text-indigo-600 rounded border-slate-300"
          />
          Completed
        </label>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-2 text-sm rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-3 py-2 text-sm rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Save
        </button>
      </div>
    </form>
  );
}

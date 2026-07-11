"use client";

import { TaskForm } from "./TaskForm";

export function TaskDetailPanel({
  task,
  sections,
  users,
  onUpdate,
  onDelete,
  onClose,
}: {
  task: {
    id: number;
    title: string;
    description?: string | null;
    section_id?: number | null;
    due_date?: string | null;
    assignee_user_id?: number | null;
    completed?: boolean;
  };
  sections: { id: number; name: string }[];
  users: { id: number; name: string | null; email: string }[];
  onUpdate: (data: {
    title: string;
    description: string;
    section_id: number | null;
    due_date: string | null;
    assignee_user_id: number | null;
    completed: boolean;
  }) => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-800">Edit Task</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700 text-sm">
            Close
          </button>
        </div>
        <TaskForm
          sections={sections}
          users={users}
          initial={task}
          onSubmit={onUpdate}
          onCancel={onClose}
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={onDelete}
            className="px-3 py-2 text-sm rounded-md bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
          >
            Delete task
          </button>
        </div>
      </div>
    </div>
  );
}

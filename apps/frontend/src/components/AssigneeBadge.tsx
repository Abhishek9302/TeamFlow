"use client";

export function AssigneeBadge({ name }: { name?: string | null }) {
  if (!name) return <span className="text-xs text-slate-400">Unassigned</span>;
  return (
    <span className="inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
      {name}
    </span>
  );
}

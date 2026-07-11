"use client";

import Link from "next/link";

export function ProjectCard({ project }: { project: { id: number; name: string; description?: string | null } }) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-white border border-slate-200 rounded-lg p-4 hover:shadow-sm transition"
    >
      <h3 className="font-semibold text-slate-800">{project.name}</h3>
      {project.description ? <p className="text-sm text-slate-500 mt-1">{project.description}</p> : null}
    </Link>
  );
}

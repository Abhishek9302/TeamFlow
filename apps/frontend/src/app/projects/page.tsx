"use client";

import { useEffect, useState } from "react";
import { apiJSON } from "@/lib/api";
import { ProjectCard } from "@/components/ProjectCard";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<{ id: number; name: string; description?: string | null }[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await apiJSON("/api/projects");
      setProjects(data.projects || []);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await apiJSON("/api/projects", {
      method: "POST",
      body: JSON.stringify({ name, description }),
    });
    setName("");
    setDescription("");
    fetchProjects();
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-slate-800">Projects</h1>
      <form onSubmit={create} className="flex flex-col gap-2 bg-white border border-slate-200 rounded-lg p-4">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New project name"
            className="flex-1 border border-slate-300 rounded-md px-3 py-2 text-sm"
            required
          />
          <button type="submit" className="bg-indigo-600 text-white rounded-md px-4 py-2 text-sm hover:bg-indigo-700">
            Create
          </button>
        </div>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
      </form>
      {loading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  );
}

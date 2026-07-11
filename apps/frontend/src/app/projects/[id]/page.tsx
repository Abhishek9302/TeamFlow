"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiJSON } from "@/lib/api";
import { TaskList } from "@/components/TaskList";
import { TaskBoard } from "@/components/TaskBoard";
import { TaskDetailPanel } from "@/components/TaskDetailPanel";
import { TaskForm } from "@/components/TaskForm";
import { ProjectMembersPanel } from "@/components/ProjectMembersPanel";

type Member = {
  id: number;
  name: string | null;
  email: string;
  role: string;
};

export default function ProjectPage() {
  const { id } = useParams() as { id: string };
  const [project, setProject] = useState<{ name: string } | null>(null);
  const [sections, setSections] = useState<{ id: number; name: string }[]>([]);
  const [tasks, setTasks] = useState<
    {
      id: number;
      title: string;
      completed: boolean;
      section_id?: number | null;
      due_date?: string | null;
      assignee_name?: string | null;
      description?: string | null;
      assignee_user_id?: number | null;
    }[]
  >([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [view, setView] = useState<"list" | "board">("list");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const fetchMembers = async () => {
    try {
      const data = await apiJSON(`/api/projects/${id}/members`);
      setMembers(data.members || []);
    } catch {
      setMembers([]);
    }
  };

  const fetchAll = async () => {
    try {
      const [proj, secs, tks] = await Promise.all([
        apiJSON(`/api/projects/${id}`),
        apiJSON(`/api/projects/${id}/sections`),
        apiJSON(`/api/tasks?project_id=${id}`),
      ]);
      setProject(proj);
      setSections(secs.sections || []);
      setTasks(tks.tasks || []);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchAll();
    fetchMembers();
  }, [id]);

  const assigneeUsers = members.map((m) => ({ id: m.id, name: m.name, email: m.email }));

  const toggleTask = async (taskId: number) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    await apiJSON(`/api/tasks/${taskId}`, {
      method: "PATCH",
      body: JSON.stringify({ completed: !task.completed }),
    });
    fetchAll();
  };

  const updateTask = async (data: {
    title: string;
    description: string;
    section_id: number | null;
    due_date: string | null;
    assignee_user_id: number | null;
    completed: boolean;
  }) => {
    if (!selectedTaskId) return;
    await apiJSON(`/api/tasks/${selectedTaskId}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    setSelectedTaskId(null);
    fetchAll();
  };

  const deleteTask = async () => {
    if (!selectedTaskId) return;
    await apiJSON(`/api/tasks/${selectedTaskId}`, { method: "DELETE" });
    setSelectedTaskId(null);
    fetchAll();
  };

  const createTask = async (data: {
    title: string;
    description: string;
    section_id: number | null;
    due_date: string | null;
    assignee_user_id: number | null;
    completed: boolean;
  }) => {
    await apiJSON("/api/tasks", {
      method: "POST",
      body: JSON.stringify({ ...data, project_id: Number(id) }),
    });
    setShowCreate(false);
    fetchAll();
  };

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">{project?.name || "Project"}</h1>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border border-slate-300 overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 text-sm ${view === "list" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`}
            >
              List
            </button>
            <button
              onClick={() => setView("board")}
              className={`px-3 py-1.5 text-sm ${view === "board" ? "bg-indigo-600 text-white" : "bg-white text-slate-700"}`}
            >
              Board
            </button>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 text-white rounded-md px-3 py-1.5 text-sm hover:bg-indigo-700"
          >
            + Task
          </button>
        </div>
      </div>

      <ProjectMembersPanel projectId={id} members={members} onChange={fetchMembers} />

      {view === "list" ? (
        <TaskList tasks={tasks} onTaskClick={setSelectedTaskId} onToggle={toggleTask} />
      ) : (
        <TaskBoard sections={sections} tasks={tasks} onTaskClick={setSelectedTaskId} onToggle={toggleTask} />
      )}

      {showCreate ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 bg-black/30">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-800">New Task</h3>
              <button onClick={() => setShowCreate(false)} className="text-slate-500 hover:text-slate-700 text-sm">
                Close
              </button>
            </div>
            <TaskForm sections={sections} users={assigneeUsers} onSubmit={createTask} onCancel={() => setShowCreate(false)} />
          </div>
        </div>
      ) : null}

      {selectedTask ? (
        <TaskDetailPanel
          task={selectedTask}
          sections={sections}
          users={assigneeUsers}
          onUpdate={updateTask}
          onDelete={deleteTask}
          onClose={() => setSelectedTaskId(null)}
        />
      ) : null}
    </div>
  );
}

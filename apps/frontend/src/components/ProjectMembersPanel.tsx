"use client";

import { useState } from "react";
import { apiJSON } from "@/lib/api";

type Member = {
  id: number;
  name: string | null;
  email: string;
  role: string;
};

export function ProjectMembersPanel({
  projectId,
  members,
  onChange,
}: {
  projectId: string;
  members: Member[];
  onChange: () => void;
}) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await apiJSON(`/api/projects/${projectId}/members`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim() }),
      });
      setEmail("");
      onChange();
    } catch (err: any) {
      let msg = err?.message || "Failed to add person";
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.error) msg = parsed.error;
      } catch {
        // keep raw
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  const removeMember = async (userId: number) => {
    setError("");
    setBusy(true);
    try {
      await apiJSON(`/api/projects/${projectId}/members/${userId}`, { method: "DELETE" });
      onChange();
    } catch (err: any) {
      let msg = err?.message || "Failed to remove";
      try {
        const parsed = JSON.parse(msg);
        if (parsed?.error) msg = parsed.error;
      } catch {
        // keep raw
      }
      setError(msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h2 className="text-sm font-semibold text-slate-800 mb-3">People</h2>
      <ul className="flex flex-col gap-2 mb-3">
        {members.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-2 text-sm">
            <div className="min-w-0">
              <div className="text-slate-800 truncate">{m.name || m.email}</div>
              <div className="text-slate-500 text-xs truncate">
                {m.email}
                {m.role === "owner" ? " · owner" : ""}
              </div>
            </div>
            {m.role !== "owner" ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => removeMember(m.id)}
                className="text-xs text-red-600 hover:text-red-700 shrink-0"
              >
                Remove
              </button>
            ) : null}
          </li>
        ))}
        {!members.length ? <li className="text-sm text-slate-500">No members yet</li> : null}
      </ul>
      <form onSubmit={addMember} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Add by email (must be registered)"
          className="flex-1 border border-slate-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          disabled={busy}
          className="bg-indigo-600 text-white rounded-md px-3 py-1.5 text-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          Add
        </button>
      </form>
      {error ? <p className="text-xs text-red-600 mt-2">{error}</p> : null}
    </div>
  );
}

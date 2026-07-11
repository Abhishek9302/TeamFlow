"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiJSON } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const data = await apiJSON("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
      });
      localStorage.setItem("token", data.token);
      router.replace("/projects");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto mt-12">
      <h1 className="text-xl font-semibold text-slate-800 mb-4">Register</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-slate-300 rounded-md px-3 py-2 text-sm"
          required
        />
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button type="submit" className="bg-indigo-600 text-white rounded-md px-3 py-2 text-sm hover:bg-indigo-700">
          Create account
        </button>
      </form>
    </div>
  );
}

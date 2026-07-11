"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function Navbar() {
  const { user, logout } = useAuth();
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/projects" className="font-semibold text-lg text-slate-800">
          TeamFlow
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/projects" className="text-sm text-slate-600 hover:text-slate-900">
                Projects
              </Link>
              <Link href="/my-tasks" className="text-sm text-slate-600 hover:text-slate-900">
                My Tasks
              </Link>
              <span className="text-sm text-slate-500">{user.name || user.email}</span>
              <button onClick={logout} className="text-sm text-red-600 hover:text-red-700">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
                Log in
              </Link>
              <Link href="/register" className="text-sm text-slate-600 hover:text-slate-900">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

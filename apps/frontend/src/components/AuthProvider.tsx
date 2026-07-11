"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { apiJSON } from "@/lib/api";

type User = { id: number; email: string; name: string | null };

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => void;
}>({ user: null, loading: true, refresh: async () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    try {
      const me = await apiJSON("/api/auth/me");
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/login";
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, refresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

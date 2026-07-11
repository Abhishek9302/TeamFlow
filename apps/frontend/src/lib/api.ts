const API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function getToken() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("token") || "";
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = `${API}${path}`;
  const headers = new Headers(opts.headers || {});
  headers.set("Content-Type", "application/json");
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(url, { ...opts, headers });
  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      const path = window.location.pathname;
      if (path !== "/login" && path !== "/register") {
        window.location.href = "/login";
      }
    }
  }
  return res;
}

export async function apiJSON(path: string, opts: RequestInit = {}) {
  const res = await apiFetch(path, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(text);
  }
  return res.json();
}
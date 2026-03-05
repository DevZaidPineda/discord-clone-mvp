const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || "Request failed");
  }

  return res.json();
}

export const api = {
  // Auth
  register: (data: { email: string; username: string; password: string }) =>
    request<{ user: any; token: string }>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<{ user: any; token: string }>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  getMe: () => request<any>("/auth/me"),

  // Servers
  getServers: () => request<any[]>("/servers"),

  getServer: (id: string) => request<any>(`/servers/${id}`),

  createServer: (name: string) =>
    request<any>("/servers", { method: "POST", body: JSON.stringify({ name }) }),

  joinServer: (inviteCode: string) =>
    request<any>("/servers/join", { method: "POST", body: JSON.stringify({ inviteCode }) }),

  // Channels
  createChannel: (serverId: string, name: string, type: "TEXT" | "VOICE" = "TEXT") =>
    request<any>(`/channels/${serverId}`, { method: "POST", body: JSON.stringify({ name, type }) }),

  // Messages
  getMessages: (channelId: string, cursor?: string) =>
    request<{ messages: any[]; nextCursor: string | null }>(
      `/messages/${channelId}${cursor ? `?cursor=${cursor}` : ""}`
    ),
};

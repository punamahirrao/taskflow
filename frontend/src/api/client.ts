const API_BASE_URL = "http://localhost:8000";

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = sessionStorage.getItem("refresh_token");
  if (!refresh) return null;

  try {
    const response = await fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!response.ok) return null;
    const data = await response.json() as { access?: string };
    if (!data.access) return null;
    sessionStorage.setItem("access_token", data.access);
    return data.access;
  } catch {
    return null;
  }
}

function clearSession() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
}

async function errorFrom(response: Response): Promise<Error> {
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      for (const key of ["detail", "message", "error"]) {
        if (typeof record[key] === "string") return new Error(record[key]);
      }
      const messages = Object.entries(record).flatMap(([field, value]) =>
        (Array.isArray(value) ? value : [value])
          .filter((message): message is string => typeof message === "string")
          .map((message) => `${field}: ${message}`),
      );
      if (messages.length) return new Error(messages.join(" "));
    }
  } catch {
    return new Error(response.statusText || "Request failed.");
  }
  return new Error(response.statusText || "Request failed.");
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = sessionStorage.getItem("access_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const url = `${API_BASE_URL}${path}`;
  let response = await fetch(url, { ...options, headers });

  const canRefresh = !path.includes("/accounts/login/") &&
    !path.includes("/accounts/register/") && !path.includes("/accounts/token/refresh/");
  if (response.status === 401 && canRefresh) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      response = await fetch(url, { ...options, headers });
    } else {
      clearSession();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!response.ok) throw await errorFrom(response);
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

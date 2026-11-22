import type { TokenRefreshResponse } from "../entities/auth";
import { translate } from "../shared/i18n/translate";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000";

async function send(url: string, options: RequestInit): Promise<Response> {
  try {
    const timeout = AbortSignal.timeout(30000);
    const signal = options.signal ? AbortSignal.any([options.signal, timeout]) : timeout;
    return await fetch(url, { ...options, signal });
  } catch (cause) {
    if (options.signal?.aborted) throw cause;
    throw new Error(translate("common.apiUnreachable", { url }), { cause });
  }
}

let pendingRefresh: { token: string; promise: Promise<string | null> } | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  const refresh = sessionStorage.getItem("refresh_token");
  if (!refresh) return null;
  if (pendingRefresh?.token === refresh) return pendingRefresh.promise;
  const promise = (async () => {
    const response = await send(`${API_BASE_URL}/accounts/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (response.status === 401 || response.status === 403) return null;
    if (!response.ok)
      throw new Error("Session verification is temporarily unavailable. Please try again.");
    const data = (await response.json()) as TokenRefreshResponse;
    if (!data.access) throw new Error("The server returned an invalid session response.");
    if (sessionStorage.getItem("refresh_token") !== refresh)
      throw new Error("Your session changed. Please retry.");
    sessionStorage.setItem("access_token", data.access);
    return data.access;
  })();
  pendingRefresh = { token: refresh, promise };
  try {
    return await promise;
  } finally {
    if (pendingRefresh?.promise === promise) pendingRefresh = null;
  }
}

function clearSession() {
  sessionStorage.removeItem("active_organization_id");
  sessionStorage.removeItem("selected_project");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
  window.dispatchEvent(new Event("taskflow:session-cleared"));
}

async function errorFrom(response: Response): Promise<Error> {
  try {
    const data: unknown = await response.json();
    if (typeof data === "object" && data !== null) {
      const record = data as Record<string, unknown>;
      for (const key of ["detail", "message", "error"]) {
        if (typeof record[key] === "string") return new Error(record[key]);
      }
      const messages: string[] = [];
      function collect(value: unknown, field: string, depth = 0) {
        if (depth > 8 || messages.length >= 20) return;
        if (typeof value === "string") messages.push(field ? `${field}: ${value}` : value);
        else if (Array.isArray(value))
          value
            .slice(0, 20)
            .forEach((item, index) =>
              collect(item, typeof item === "string" ? field : `${field}.${index}`, depth + 1),
            );
        else if (value && typeof value === "object")
          Object.entries(value)
            .slice(0, 20)
            .forEach(([key, item]) => collect(item, field ? `${field}.${key}` : key, depth + 1));
      }
      collect(record, "");
      if (messages.length) return new Error(messages.join(" "));
    }
  } catch {
    return new Error(response.statusText || translate("common.requestFailed"));
  }
  return new Error(response.statusText || translate("common.requestFailed"));
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = sessionStorage.getItem("access_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const organizationId = sessionStorage.getItem("active_organization_id");
  if (token && organizationId) headers.set("X-Organization-ID", organizationId);
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");

  const url = `${API_BASE_URL}${path}`;
  let response = await send(url, { ...options, headers });

  const canRefresh =
    !path.includes("/accounts/login/") &&
    !path.includes("/accounts/register/") &&
    !path.includes("/accounts/token/refresh/");
  if (response.status === 401 && canRefresh) {
    const currentToken = sessionStorage.getItem("access_token");
    const refreshed =
      currentToken && currentToken !== token ? currentToken : await refreshAccessToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      response = await send(url, { ...options, headers });
    } else {
      clearSession();
      window.location.href = "/login";
      throw new Error(translate("common.sessionExpired"));
    }
  }

  if (!response.ok) throw await errorFrom(response);
  const result = response.status === 204 ? (undefined as T) : ((await response.json()) as T);
  if (
    options.method &&
    !["GET", "HEAD", "OPTIONS"].includes(options.method.toUpperCase()) &&
    !/\/accounts\/(login|register|google|microsoft|token)\//.test(path)
  ) {
    window.dispatchEvent(new CustomEvent("taskflow:data-changed", { detail: path }));
  }
  return result;
}

export async function apiFetchBlob(path: string): Promise<Blob> {
  const headers = new Headers();
  const token = sessionStorage.getItem("access_token");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const organizationId = sessionStorage.getItem("active_organization_id");
  if (token && organizationId) headers.set("X-Organization-ID", organizationId);
  const url = `${API_BASE_URL}${path}`;
  let response = await send(url, { headers });
  if (response.status === 401 && !path.includes("/accounts/")) {
    const currentToken = sessionStorage.getItem("access_token");
    const refreshed =
      currentToken && currentToken !== token ? currentToken : await refreshAccessToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      response = await send(url, { headers });
    } else {
      clearSession();
      window.location.href = "/login";
      throw new Error(translate("common.sessionExpired"));
    }
  }
  if (!response.ok) throw await errorFrom(response);
  return response.blob();
}

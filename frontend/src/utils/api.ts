const API_BASE_URL = "http://localhost:8000";

export async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = sessionStorage.getItem("refresh_token");

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/accounts/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const accessToken = data.access;

    if (!accessToken) {
      return null;
    }

    sessionStorage.setItem("access_token", accessToken);
    return accessToken;
  } catch (error) {
    console.error("Token refresh failed:", error);
    return null;
  }
}

export async function apiFetch<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const accessToken = sessionStorage.getItem("access_token");

  const headers = new Headers(options.headers || {});

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const requestUrl = `${API_BASE_URL}${url}`;
  let response = await fetch(requestUrl, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const shouldRefresh =
      !url.includes("/accounts/login/") &&
      !url.includes("/accounts/register/") &&
      !url.includes("/accounts/token/refresh/");

    if (shouldRefresh) {
      const newAccessToken = await refreshAccessToken();

      if (newAccessToken) {
        const retryHeaders = new Headers(options.headers || {});
        retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);

        if (options.body && !retryHeaders.has("Content-Type")) {
          retryHeaders.set("Content-Type", "application/json");
        }

        response = await fetch(requestUrl, {
          ...options,
          headers: retryHeaders,
        });
      } else {
        sessionStorage.removeItem("access_token");
        sessionStorage.removeItem("refresh_token");
        sessionStorage.removeItem("user");
        window.location.href = "/login";
        throw new Error("Session expired. Please log in again.");
      }
    }
  }

  if (!response.ok) {
    let errorMessage = "Request failed.";

    try {
      const errorData = await response.json();
      if (errorData?.detail) {
        errorMessage = errorData.detail;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (errorData?.error) {
        errorMessage = errorData.error;
      }
    } catch {
      errorMessage = response.statusText || "Request failed.";
    }

    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

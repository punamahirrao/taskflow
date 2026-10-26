export function clearAuthSession() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
}

export function hasAccessToken() {
  return Boolean(sessionStorage.getItem("access_token"));
}

export function getStoredUser<T>() {
  const value = sessionStorage.getItem("user");
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

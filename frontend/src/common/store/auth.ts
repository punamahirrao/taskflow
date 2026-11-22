import { store } from "./index";
import { resetSessionState } from "./sessionEffects";

export function clearAuthSession() {
  sessionStorage.removeItem("active_organization_id");
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("selected_project");
  resetSessionState(store.dispatch);
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

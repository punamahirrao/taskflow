import { store } from "./index";
import { sessionActions } from "./sessionSlice";
import { projectActions } from "./projectsSlice";
import { boardActions } from "./boardsSlice";
import { dashboardActions } from "./dashboardSlice";

export function clearAuthSession() {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("refresh_token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("selected_project");
  store.dispatch(sessionActions.userChanged(null));
  store.dispatch(projectActions.projectSelectionCleared());
  store.dispatch(boardActions.boardsCleared());
  store.dispatch(dashboardActions.dashboardCleared());
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

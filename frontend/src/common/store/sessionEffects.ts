import { setupListeners } from "@reduxjs/toolkit/query";
import { queryApi } from "../api/queryApi";
import { projectActions } from "../../projects/store/projectSelectionSlice";
import { sessionActions } from "./sessionSlice";
import type { AppDispatch } from "./index";

export function resetSessionState(dispatch: AppDispatch) {
  dispatch(queryApi.util.resetApiState());
  dispatch(sessionActions.userChanged(null));
  dispatch(projectActions.projectSelectionCleared());
}

export function bindStoreEvents(dispatch: AppDispatch) {
  const stopQueryListeners = setupListeners(dispatch);
  const clearSession = () => resetSessionState(dispatch);
  const refreshData = (event: Event) => {
    dispatch(queryApi.util.invalidateTags(["Tasks", "Documents", "Planning", "Audit", "Usage"]));
    const path = (event as CustomEvent<string>).detail;
    if (/^\/projects\/(?:$|\d+\/$)/.test(path))
      dispatch(queryApi.util.invalidateTags(["Projects"]));
  };
  window.addEventListener("taskflow:session-cleared", clearSession);
  window.addEventListener("taskflow:data-changed", refreshData);
  return () => {
    stopQueryListeners();
    window.removeEventListener("taskflow:session-cleared", clearSession);
    window.removeEventListener("taskflow:data-changed", refreshData);
  };
}

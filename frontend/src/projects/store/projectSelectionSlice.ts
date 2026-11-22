import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

const storageKey = "selected_project";
function readSelection() {
  try {
    return sessionStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

const projectSelection = createSlice({
  name: "projectSelection",
  initialState: () => ({ selected: readSelection() }),
  reducers: {
    projectSelected(state, action: PayloadAction<string>) {
      state.selected = action.payload;
    },
    projectSelectionCleared(state) {
      state.selected = null;
    },
  },
});

export function saveProjectSelection(projectId: number | null) {
  const selection = projectId === null ? "all" : String(projectId);
  try {
    sessionStorage.setItem(storageKey, selection);
  } catch {
    // Keep the selection in Redux when browser storage is unavailable.
  }
  return projectActions.projectSelected(selection);
}

export const projectActions = projectSelection.actions;
export default projectSelection.reducer;

import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { getProjects, setDefaultProject } from "../../projects/api/projects";
import type { Project } from "../entities/project";
import { translate } from "../shared/i18n/translate";

const SELECTED_PROJECT_KEY = "selected_project";
const getStoredSelection = () => { try { return sessionStorage.getItem(SELECTED_PROJECT_KEY); } catch { return null; } };
interface ProjectsState { projects: Project[]; selected: string | null; loading: boolean; error: string }
const initialState: ProjectsState = { projects: [], selected: getStoredSelection(), loading: true, error: "" };
export const loadProjects = createAsyncThunk<Project[], void, { rejectValue: string }>("projects/load", async (_, { rejectWithValue }) => { try { return await getProjects(); } catch (error) { return rejectWithValue(error instanceof Error ? error.message : translate("projectSwitcher.loadFailed")); } });
export const saveDefaultProject = createAsyncThunk("projects/saveDefault", async (projectId: number | null) => { await setDefaultProject(projectId); return projectId; });
const projectsSlice = createSlice({
  name: "projects", initialState,
  reducers: {
    projectSelected(state, action: PayloadAction<number | null>) {
      const value = action.payload === null ? "all" : String(action.payload);
      state.selected = value;
      try { sessionStorage.setItem(SELECTED_PROJECT_KEY, value); } catch { /* session storage may be disabled */ }
    },
    projectSelectionCleared(state) { state.selected = null; state.projects = []; state.loading = true; state.error = ""; try { sessionStorage.removeItem(SELECTED_PROJECT_KEY); } catch { /* session storage may be disabled */ } },
  },
  extraReducers(builder) {
    builder.addCase(loadProjects.pending, (state) => { state.loading = true; state.error = ""; })
      .addCase(loadProjects.fulfilled, (state, action) => { state.projects = action.payload; state.loading = false; })
      .addCase(loadProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? action.error.message ?? translate("projectSwitcher.loadFailed"); })
      .addCase(saveDefaultProject.fulfilled, (state, action) => { state.projects = state.projects.map((project) => ({ ...project, is_default: project.id === action.payload })); });
  },
});
export const projectActions = projectsSlice.actions;
export default projectsSlice.reducer;

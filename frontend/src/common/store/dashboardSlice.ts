import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getProjectTasks } from "../../project-detail/api/tasks";
import type { Project } from "../entities/project";
import type { Task } from "../entities/task";
import type { DashboardStats } from "../../dashboard/entities/dashboard";
import { translate } from "../shared/i18n/translate";

interface DashboardState { stats: DashboardStats | null; loading: boolean; error: string }
const initialState: DashboardState = { stats: null, loading: true, error: "" };
export const loadDashboardStats = createAsyncThunk<DashboardStats, { projects: Project[]; selectedId: number | null }, { rejectValue: string }>("dashboard/loadStats", async ({ projects, selectedId }, { rejectWithValue }) => {
  try {
    const visible = selectedId === null ? projects : projects.filter((project) => project.id === selectedId);
    const groups = await Promise.all(visible.map((project) => getProjectTasks(project.id)));
    const tasks: Task[] = groups.flat();
    const completedTasks = tasks.filter((task) => task.status === "done").length;
    return { totalProjects: visible.length, completedTasks, pendingTasks: tasks.length - completedTasks, completionRate: tasks.length ? Math.round(completedTasks / tasks.length * 100) : 0 };
  } catch (error) { return rejectWithValue(error instanceof Error ? error.message : translate("dashboard.loadError")); }
});
const dashboardSlice = createSlice({ name: "dashboard", initialState, reducers: { dashboardCleared: () => initialState }, extraReducers: (builder) => builder
  .addCase(loadDashboardStats.pending, (state) => { state.loading = true; state.error = ""; })
  .addCase(loadDashboardStats.fulfilled, (state, action) => { state.loading = false; state.stats = action.payload; })
  .addCase(loadDashboardStats.rejected, (state, action) => { state.loading = false; state.error = action.payload ?? action.error.message ?? translate("dashboard.loadError"); }) });
export const dashboardActions = dashboardSlice.actions;
export default dashboardSlice.reducer;

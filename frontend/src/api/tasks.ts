import { apiFetch } from "./client";
import type { BoardColumn, Sprint, Task, TaskStatus } from "../entities/task";

export const getTasks = (projectId?: number | string | null, sprintId?: number | "active" | null) => {
  const params = new URLSearchParams();
  if (projectId !== undefined && projectId !== null) params.set("project_id", String(projectId));
  if (sprintId) params.set("sprint_id", String(sprintId));
  return apiFetch<Task[]>(`/tasks/${params.size ? `?${params}` : ""}`);
};

export const getProjectTasks = (projectId: number | string) => getTasks(projectId);

export const createTask = (input: Partial<Task> & { project_id: number; title: string }) =>
  apiFetch<Task>("/tasks/", { method: "POST", body: JSON.stringify(input) });

export const updateTask = (taskId: number, input: Partial<Task>) =>
  apiFetch<Task>(`/tasks/${taskId}/`, { method: "PATCH", body: JSON.stringify(input) });

export const updateTaskStatus = (taskId: number, status: TaskStatus) =>
  updateTask(taskId, { status });

export const getBoardColumns = (projectId: number) => apiFetch<BoardColumn[]>(`/tasks/projects/${projectId}/columns/`);
export const addBoardColumn = (projectId: number, name: string, wip_limit: number | null) =>
  apiFetch<BoardColumn>(`/tasks/projects/${projectId}/columns/`, { method: "POST", body: JSON.stringify({ name, wip_limit }) });
export const updateBoardColumn = (projectId: number, columnId: number, input: Partial<BoardColumn>) =>
  apiFetch<BoardColumn>(`/tasks/projects/${projectId}/columns/${columnId}/`, { method: "PATCH", body: JSON.stringify(input) });
export const getSprints = (projectId?: number | null) =>
  apiFetch<Sprint[]>(`/tasks/sprints/${projectId ? `?project_id=${projectId}` : ""}`);
export const createSprint = (project_id: number, name: string, is_active: boolean, start_date?: string, end_date?: string, goal = "", capacity_points?: number | null) =>
  apiFetch<Sprint>("/tasks/sprints/", { method: "POST", body: JSON.stringify({ project_id, name, is_active, start_date: start_date || null, end_date: end_date || null, goal, capacity_points: capacity_points || null }) });
export const updateSprint = (sprintId: number, input: Partial<Sprint>) =>
  apiFetch<Sprint>(`/tasks/sprints/${sprintId}/`, { method: "PATCH", body: JSON.stringify(input) });
export const closeSprint = (sprintId: number) =>
  apiFetch<{ sprint: Sprint; next_sprint: Sprint | null; moved_count: number; message: string }>(`/tasks/sprints/${sprintId}/close/`, { method: "POST", body: JSON.stringify({}) });

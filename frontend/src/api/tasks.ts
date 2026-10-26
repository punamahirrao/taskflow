import { apiFetch } from "./client";
import type { Task, TaskStatus } from "../entities/task";

export const getProjectTasks = (projectId: number | string) =>
  apiFetch<Task[]>(`/tasks/?project_id=${projectId}`);

export const updateTaskStatus = (taskId: number, status: TaskStatus) =>
  apiFetch<Task>(`/tasks/${taskId}/`, { method: "PATCH", body: JSON.stringify({ status }) });

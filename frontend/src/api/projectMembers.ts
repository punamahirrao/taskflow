import { apiFetch } from "./client";
import type { ProjectMember } from "../entities/project";

export const addProjectMember = (projectId: number | string, userId: number, role: string) =>
  apiFetch<ProjectMember>(`/projects/${projectId}/members/`, { method: "POST", body: JSON.stringify({ user_id: userId, role }) });
export const updateProjectMember = (projectId: number | string, userId: number, role: string) =>
  apiFetch<ProjectMember>(`/projects/${projectId}/members/${userId}/`, { method: "PATCH", body: JSON.stringify({ role }) });
export const removeProjectMember = (projectId: number | string, userId: number) =>
  apiFetch<void>(`/projects/${projectId}/members/${userId}/`, { method: "DELETE" });

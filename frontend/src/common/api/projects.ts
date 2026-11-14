import { apiFetch } from "./client";
import type { DefaultProjectResponse, Project, ProjectCreateInput } from "../entities/project";

export const getProjects = () => apiFetch<Project[]>("/projects/");
export const createProject = (input: ProjectCreateInput) => apiFetch<Project>("/projects/", {
  method: "POST", body: JSON.stringify(input),
});
export const updateProject = (id: number, input: Partial<ProjectCreateInput>) => apiFetch<Project>(`/projects/${id}/`, {
  method: "PATCH", body: JSON.stringify(input),
});
export const setDefaultProject = (projectId: number | null) => apiFetch<DefaultProjectResponse>("/projects/default/", {
  method: "PUT", body: JSON.stringify({ project_id: projectId }),
});

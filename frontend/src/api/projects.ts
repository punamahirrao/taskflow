import { apiFetch } from "./client";
import type { Project, ProjectCreateInput } from "../entities/project";

export const getProjects = () => apiFetch<Project[]>("/projects/");
export const createProject = (input: ProjectCreateInput) => apiFetch<Project>("/projects/", {
  method: "POST", body: JSON.stringify(input),
});
export const setDefaultProject = (projectId: number | null) => apiFetch<{ default_project_id: number | null }>("/projects/default/", {
  method: "PUT", body: JSON.stringify({ project_id: projectId }),
});

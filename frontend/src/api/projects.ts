import { apiFetch } from "./client";
import type { Project, ProjectCreateInput } from "../entities/project";

export const getProjects = () => apiFetch<Project[]>("/projects/");
export const createProject = (input: ProjectCreateInput) => apiFetch<Project>("/projects/", {
  method: "POST", body: JSON.stringify(input),
});

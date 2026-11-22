import { apiFetch } from "../../common/api/client";
import type {
  DefaultProjectResponse,
  Project,
  ProjectCreateInput,
  ProjectOwner,
} from "../../common/entities/project";

export const getProjects = (signal?: AbortSignal) => apiFetch<Project[]>("/projects/", { signal });
export interface ProjectDirectoryEntry {
  id: number;
  name: string;
  has_access: boolean;
  is_assigned?: boolean;
  description?: string;
  status?: Project["status"];
  expected_start_date?: string | null;
  end_date?: string | null;
  owner_details?: ProjectOwner | null;
  access_request_status?: "pending" | "approved" | "declined" | null;
}
export interface ProjectAccessRequest {
  id: number;
  project_id: number;
  project_name: string;
  requester: ProjectOwner;
  requested_role: "member" | "viewer";
  reason: string;
  status: "pending" | "approved" | "declined";
  created_at: string;
}
export const requestProjectAccess = (
  projectId: number,
  input: { requested_role: "member" | "viewer"; reason: string },
) =>
  apiFetch<ProjectAccessRequest>(`/projects/${projectId}/access-requests/`, {
    method: "POST",
    body: JSON.stringify(input),
  });
export const getProjectAccessRequests = () =>
  apiFetch<ProjectAccessRequest[]>("/projects/access-requests/");
export const reviewProjectAccessRequest = (id: number, status: "approved" | "declined") =>
  apiFetch<ProjectAccessRequest>(`/projects/access-requests/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
export const searchProjectDirectory = (query = "") =>
  apiFetch<ProjectDirectoryEntry[]>(`/projects/directory/?q=${encodeURIComponent(query)}`);
export const createProject = (input: ProjectCreateInput) =>
  apiFetch<Project>("/projects/", {
    method: "POST",
    body: JSON.stringify(input),
  });
export const updateProject = (id: number, input: Partial<ProjectCreateInput>) =>
  apiFetch<Project>(`/projects/${id}/`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
export const setDefaultProject = (projectId: number | null) =>
  apiFetch<DefaultProjectResponse>("/projects/default/", {
    method: "PUT",
    body: JSON.stringify({ project_id: projectId }),
  });

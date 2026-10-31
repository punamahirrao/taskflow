import { apiFetch, apiFetchBlob } from "./client";
import type { DocumentFolder, DocumentLocation, ResourceLink, WorkspaceDocument } from "../entities/document";

export async function getDocumentLibrary(location: DocumentLocation, folderId: number | null) {
  const params = new URLSearchParams();
  if (location === "personal") params.set("project_id", "personal");
  else if (location !== "all") params.set("project_id", String(location));
  if (folderId !== null) params.set("folder_id", String(folderId));
  return apiFetch<{ folders: DocumentFolder[]; documents: WorkspaceDocument[]; links: ResourceLink[] }>(`/documents/${params.size ? `?${params}` : ""}`);
}

export const createDocumentFolder = (name: string, location: DocumentLocation, parentId: number | null) =>
  apiFetch<DocumentFolder>("/documents/folders/", { method: "POST", body: JSON.stringify({ name, project_id: location === "all" ? "personal" : location, parent_id: parentId }) });

export const renameDocumentFolder = (folderId: number, name: string) =>
  apiFetch<DocumentFolder>(`/documents/folders/${folderId}/`, { method: "PATCH", body: JSON.stringify({ name }) });

export const deleteDocumentFolder = (folderId: number) =>
  apiFetch<void>(`/documents/folders/${folderId}/`, { method: "DELETE" });

export async function uploadDocument(file: File, location: DocumentLocation, folderId: number | null) {
  const form = new FormData();
  form.append("file", file);
  form.append("name", file.name);
  form.append("project_id", String(location === "all" ? "personal" : location));
  if (folderId !== null) form.append("folder_id", String(folderId));
  return apiFetch<WorkspaceDocument>("/documents/", { method: "POST", body: form });
}

export const deleteDocument = (documentId: number) => apiFetch<void>(`/documents/files/${documentId}/`, { method: "DELETE" });
export const downloadDocument = (documentId: number) => apiFetchBlob(`/documents/files/${documentId}/download/`);
export const createResourceLink = (name: string, url: string, location: DocumentLocation, folderId: number | null) =>
  apiFetch<ResourceLink>("/documents/links/", { method: "POST", body: JSON.stringify({ name, url, project_id: location === "all" ? "personal" : location, folder_id: folderId }) });
export const deleteResourceLink = (linkId: number) => apiFetch<void>(`/documents/links/${linkId}/`, { method: "DELETE" });

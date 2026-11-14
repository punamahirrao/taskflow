export interface DocumentFolder {
  id: number;
  name: string;
  project: number | null;
  project_name: string | null;
  owner: number | null;
  owner_name: string;
  parent: number | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceDocument {
  id: number;
  name: string;
  size: number;
  content_type: string;
  project: number | null;
  project_name: string | null;
  folder: number | null;
  folder_name: string | null;
  owner: number | null;
  owner_name: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceLink {
  id: number;
  name: string;
  url: string;
  project: number | null;
  project_name: string | null;
  folder: number | null;
  folder_name: string | null;
  owner: number | null;
  owner_name: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentLibrary {
  folders: DocumentFolder[];
  documents: WorkspaceDocument[];
  links: ResourceLink[];
}

export type DocumentLocation = "all" | "personal" | number;

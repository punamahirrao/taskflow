import type { DocumentFolder, ResourceLink, WorkspaceDocument } from "../../common/entities/document";

export interface DocumentCrumb {
  id: number;
  name: string;
}

export interface DocumentLibraryState {
  folders: DocumentFolder[];
  documents: WorkspaceDocument[];
  links: ResourceLink[];
  loading: boolean;
  busy: boolean;
  error: string;
  setError: (message: string) => void;
  reload: () => Promise<void>;
  createFolder: (name: string) => Promise<boolean>;
  uploadFiles: (files: File[]) => Promise<boolean>;
  renameFolder: (folder: DocumentFolder, name: string) => Promise<void>;
  removeFolder: (folder: DocumentFolder) => Promise<void>;
  removeDocument: (document: WorkspaceDocument) => Promise<void>;
  saveLink: (name: string, url: string) => Promise<boolean>;
  removeLink: (link: ResourceLink) => Promise<void>;
}

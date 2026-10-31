import { useCallback, useEffect, useState } from "react";
import { createDocumentFolder, createResourceLink, deleteDocument, deleteDocumentFolder, deleteResourceLink, getDocumentLibrary, renameDocumentFolder, uploadDocument } from "../../../api/documents";
import type { DocumentFolder, DocumentLocation, ResourceLink, WorkspaceDocument } from "../../../entities/document";

export function useDocuments(location: DocumentLocation, folderId: number | null) {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [links, setLinks] = useState<ResourceLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true);
    try { const result = await getDocumentLibrary(location, folderId); setFolders(result.folders); setDocuments(result.documents); setLinks(result.links); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to load documents."); }
    finally { setLoading(false); }
  }, [location, folderId]);
  useEffect(() => { void Promise.resolve().then(reload); }, [reload]);
  const createFolder = async (name: string) => { setBusy(true); try { await createDocumentFolder(name, location, folderId); await reload(); return true; } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to create folder."); return false; } finally { setBusy(false); } };
  const uploadFiles = async (files: File[]) => { setBusy(true); try { for (const file of files) await uploadDocument(file, location, folderId); await reload(); return true; } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to upload file."); return false; } finally { setBusy(false); } };
  const renameFolder = async (folder: DocumentFolder, name: string) => { try { await renameDocumentFolder(folder.id, name); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to rename folder."); } };
  const removeFolder = async (folder: DocumentFolder) => { try { await deleteDocumentFolder(folder.id); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete folder."); } };
  const removeDocument = async (document: WorkspaceDocument) => { try { await deleteDocument(document.id); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to remove file."); } };
  const saveLink = async (name: string, url: string) => { setBusy(true); try { await createResourceLink(name, url, location, folderId); await reload(); return true; } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save resource link."); return false; } finally { setBusy(false); } };
  const removeLink = async (link: ResourceLink) => { try { await deleteResourceLink(link.id); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to remove resource link."); } };
  return { folders, documents, links, loading, busy, error, setError, reload, createFolder, uploadFiles, renameFolder, removeFolder, removeDocument, saveLink, removeLink };
}

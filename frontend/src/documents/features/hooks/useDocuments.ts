import { useCallback, useEffect, useState } from "react";
import { createDocumentFolder, createResourceLink, deleteDocument, deleteDocumentFolder, deleteResourceLink, getDocumentLibrary, renameDocumentFolder, uploadDocument } from "../../api/documents";
import type { DocumentFolder, DocumentLocation, ResourceLink, WorkspaceDocument } from "../../../common/entities/document";
import type { DocumentLibraryState } from "../../entities/documentLibrary";
import { translate } from "../../../common/shared/i18n/translate";

export function useDocuments(location: DocumentLocation, folderId: number | null): DocumentLibraryState {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [links, setLinks] = useState<ResourceLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const reload = useCallback(async () => {
    setLoading(true);
    try { const result = await getDocumentLibrary(location, folderId); setFolders(result.folders); setDocuments(result.documents); setLinks(result.links); setError(""); }
    catch (cause) { setError(cause instanceof Error ? cause.message : translate("documents.errorLoad")); }
    finally { setLoading(false); }
  }, [location, folderId]);
  useEffect(() => { void Promise.resolve().then(reload); }, [reload]);
  const createFolder = async (name: string) => { setBusy(true); try { await createDocumentFolder(name, location, folderId); await reload(); return true; } catch (cause) { setError(cause instanceof Error ? cause.message : translate("documents.errorCreateFolder")); return false; } finally { setBusy(false); } };
  const uploadFiles = async (files: File[]) => { setBusy(true); try { for (const file of files) await uploadDocument(file, location, folderId); await reload(); return true; } catch (cause) { setError(cause instanceof Error ? cause.message : translate("documents.errorUpload")); return false; } finally { setBusy(false); } };
  const renameFolder = async (folder: DocumentFolder, name: string) => { try { await renameDocumentFolder(folder.id, name); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : translate("documents.errorRenameFolder")); } };
  const removeFolder = async (folder: DocumentFolder) => { try { await deleteDocumentFolder(folder.id); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : translate("documents.errorDeleteFolder")); } };
  const removeDocument = async (document: WorkspaceDocument) => { try { await deleteDocument(document.id); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : translate("documents.errorRemoveFile")); } };
  const saveLink = async (name: string, url: string) => { setBusy(true); try { await createResourceLink(name, url, location, folderId); await reload(); return true; } catch (cause) { setError(cause instanceof Error ? cause.message : translate("documents.errorSaveLink")); return false; } finally { setBusy(false); } };
  const removeLink = async (link: ResourceLink) => { try { await deleteResourceLink(link.id); await reload(); } catch (cause) { setError(cause instanceof Error ? cause.message : translate("documents.errorRemoveLink")); } };
  return { folders, documents, links, loading, busy, error, setError, reload, createFolder, uploadFiles, renameFolder, removeFolder, removeDocument, saveLink, removeLink };
}

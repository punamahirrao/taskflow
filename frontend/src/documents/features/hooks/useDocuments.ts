import { useCallback, useState } from "react";
import { dataScope } from "../../../common/api/queryApi";
import { useDocumentsQuery } from "../../api/documentsQuery";
import {
  createDocumentFolder,
  createResourceLink,
  deleteDocument,
  deleteDocumentFolder,
  deleteResourceLink,
  renameDocumentFolder,
  uploadDocument,
} from "../../api/documents";
import type {
  DocumentFolder,
  DocumentLocation,
  ResourceLink,
  OrganizationDocument,
} from "../../../common/entities/document";
import type { DocumentLibraryState } from "../../entities/documentLibrary";
import { translate } from "../../../common/shared/i18n/translate";

export function useDocuments(
  location: DocumentLocation,
  folderId: number | null,
): DocumentLibraryState {
  const query = useDocumentsQuery({ ...dataScope(), location, folderId });
  const folders = query.currentData?.folders ?? [];
  const documents = query.currentData?.documents ?? [];
  const links = query.currentData?.links ?? [];
  const loading = query.isFetching;
  const [busy, setBusy] = useState(false);
  const [actionError, setError] = useState("");
  const error =
    actionError || (query.error && "message" in query.error ? String(query.error.message) : "");
  const refetch = query.refetch;
  const reload = useCallback(async () => {
    const result = await refetch();
    if (result.error) throw new Error(translate("documents.errorLoad"));
  }, [refetch]);
  const createFolder = async (name: string) => {
    setBusy(true);
    try {
      await createDocumentFolder(name, location, folderId);
      await reload();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("documents.errorCreateFolder"));
      return false;
    } finally {
      setBusy(false);
    }
  };
  const uploadFiles = async (files: File[]) => {
    setBusy(true);
    try {
      for (const file of files) await uploadDocument(file, location, folderId);
      await reload();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("documents.errorUpload"));
      return false;
    } finally {
      setBusy(false);
    }
  };
  const renameFolder = async (folder: DocumentFolder, name: string) => {
    try {
      await renameDocumentFolder(folder.id, name);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("documents.errorRenameFolder"));
    }
  };
  const removeFolder = async (folder: DocumentFolder) => {
    try {
      await deleteDocumentFolder(folder.id);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("documents.errorDeleteFolder"));
    }
  };
  const removeDocument = async (document: OrganizationDocument) => {
    try {
      await deleteDocument(document.id);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("documents.errorRemoveFile"));
    }
  };
  const saveLink = async (name: string, url: string) => {
    setBusy(true);
    try {
      await createResourceLink(name, url, location, folderId);
      await reload();
      return true;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("documents.errorSaveLink"));
      return false;
    } finally {
      setBusy(false);
    }
  };
  const removeLink = async (link: ResourceLink) => {
    try {
      await deleteResourceLink(link.id);
      await reload();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : translate("documents.errorRemoveLink"));
    }
  };
  return {
    folders,
    documents,
    links,
    loading,
    busy,
    error,
    setError,
    reload,
    createFolder,
    uploadFiles,
    renameFolder,
    removeFolder,
    removeDocument,
    saveLink,
    removeLink,
  };
}

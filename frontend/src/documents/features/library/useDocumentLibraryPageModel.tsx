import { useMemo, useState } from "react";
import type {
  DocumentFolder,
  DocumentLocation,
  OrganizationDocument,
} from "../../../common/entities/document";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { useAppSelector } from "../../../common/store";
import { downloadDocument } from "../../api/documents";
import type { DocumentCrumb } from "../../entities/documentLibrary";
import { useDocuments } from "../hooks/useDocuments";

export function useDocumentLibraryPageModel({
  projectId,
  initialLocation,
}: {
  projectId?: number;
  initialLocation: DocumentLocation;
}) {
  const { t } = useTranslation();
  const { projects, selectedId } = useProjectContext();
  const user = useAppSelector((state) => state.session.user);
  const [location, setLocation] = useState<DocumentLocation>(initialLocation);
  const [path, setPath] = useState<DocumentCrumb[]>([]);
  const [search, setSearch] = useState("");
  const [newFolder, setNewFolder] = useState(false);
  const [newLink, setNewLink] = useState(false);
  const [dragging, setDragging] = useState(false);
  const library = useDocuments(location, path.at(-1)?.id ?? null);
  const currentProject =
    typeof location === "number"
      ? (projects.find((project) => project.id === location) ?? null)
      : null;
  const canManage = (ownerId: number | null) =>
    Boolean(
      (ownerId && ownerId === user?.id) ||
      currentProject?.my_role === "owner" ||
      currentProject?.my_role === "admin",
    );
  const folders = useMemo(
    () =>
      library.folders.filter((folder) => folder.name.toLowerCase().includes(search.toLowerCase())),
    [library.folders, search],
  );
  const documents = useMemo(
    () =>
      library.documents.filter((document) =>
        document.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [library.documents, search],
  );
  const links = useMemo(
    () =>
      library.links.filter((link) =>
        `${link.name} ${link.url}`.toLowerCase().includes(search.toLowerCase()),
      ),
    [library.links, search],
  );

  function changeLocation(value: string) {
    setLocation(value === "all" ? "all" : value === "personal" ? "personal" : Number(value));
    setPath([]);
    setSearch("");
  }

  function openFolder(folder: DocumentFolder) {
    if (location === "all") setLocation(folder.project ?? "personal");
    setPath((current) => [...current, { id: folder.id, name: folder.name }]);
    setSearch("");
  }

  async function download(document: OrganizationDocument) {
    try {
      const blob = await downloadDocument(document.id);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      library.setError(cause instanceof Error ? cause.message : t("documents.errorDownload"));
    }
  }

  return {
    t,
    projects,
    selectedId,
    location,
    setLocation,
    path,
    setPath,
    search,
    setSearch,
    newFolder,
    setNewFolder,
    newLink,
    setNewLink,
    dragging,
    setDragging,
    library,
    currentProject,
    canManage,
    folders,
    documents,
    links,
    changeLocation,
    openFolder,
    download,
    projectId,
  };
}

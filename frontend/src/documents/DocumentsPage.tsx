import { useMemo, useState, type DragEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { downloadDocument } from "./api/documents";
import type {
  DocumentFolder,
  DocumentLocation,
  OrganizationDocument,
} from "../common/entities/document";
import { DocumentBreadcrumbs } from "./components/DocumentBreadcrumbs";
import { DocumentCreationForms } from "./components/DocumentCreationForms";
import { DocumentLibraryContent } from "./components/DocumentLibraryContent";
import { DocumentToolbar } from "./components/DocumentToolbar";
import { useDocuments } from "./features/hooks/useDocuments";
import type { DocumentCrumb } from "./entities/documentLibrary";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { useAppSelector } from "../common/store";

export default function DocumentsPage({ projectId }: { projectId?: number } = {}) {
  const { selectedId } = useProjectContext();
  const [params] = useSearchParams();
  const initialLocation =
    projectId ?? (params.get("location") === "personal" ? "personal" : (selectedId ?? "all"));
  return (
    <DocumentLibraryPage
      key={initialLocation}
      projectId={projectId}
      initialLocation={initialLocation}
    />
  );
}

function DocumentLibraryPage({
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

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    if (location !== "all" && event.dataTransfer.files.length)
      void library.uploadFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <main
      className={
        projectId === undefined ? "min-h-screen bg-[#f7f7fb] p-5 md:p-8" : "w-full bg-[#f7f7fb] p-2"
      }
    >
      <div className={projectId === undefined ? "mx-auto max-w-[1440px]" : "w-full"}>
        <DocumentToolbar
          projects={projects}
          currentProjectId={selectedId}
          location={location}
          busy={library.busy}
          fixedLocation={projectId !== undefined}
          onLocationChange={changeLocation}
          onNewFolder={() => setNewFolder((value) => !value)}
          onNewLink={() => setNewLink((value) => !value)}
          onFiles={(files) => void library.uploadFiles(Array.from(files))}
        />
        <section
          onDragEnter={(event) => {
            event.preventDefault();
            if (location !== "all") setDragging(true);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDragLeave={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false);
          }}
          onDrop={onDrop}
          className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${dragging ? "border-sky-400 ring-4 ring-sky-100" : "border-slate-200"}`}
        >
          <DocumentBreadcrumbs
            location={location}
            currentProject={currentProject}
            path={path}
            search={search}
            onRoot={() => {
              setPath([]);
              if (projectId === undefined) setLocation("all");
            }}
            onScopeRoot={() => setPath([])}
            onCrumb={(index) => setPath((current) => current.slice(0, index + 1))}
            onSearch={setSearch}
          />
          <DocumentCreationForms
            showFolder={newFolder}
            showLink={newLink}
            busy={library.busy}
            personal={location === "personal"}
            onCreateFolder={library.createFolder}
            onSaveLink={library.saveLink}
            onCloseFolder={() => setNewFolder(false)}
            onCloseLink={() => setNewLink(false)}
          />
          {library.error && (
            <p
              role="alert"
              className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-700"
            >
              {library.error}
            </p>
          )}
          {location === "all" && (
            <p className="border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[calc(11px*var(--taskflow-font-scale,1))] text-slate-500">
              {t("documents.browseAll")}
            </p>
          )}
          {location !== "all" && (
            <div
              className={`border-b border-slate-100 px-5 py-3 text-xs ${dragging ? "bg-sky-50 text-sky-800" : "bg-slate-50/70 text-slate-500"}`}
            >
              {dragging
                ? t("documents.dropToUpload")
                : library.busy
                  ? t("documents.savingFiles")
                  : t("documents.dropHint")}
            </div>
          )}
          <DocumentLibraryContent
            loading={library.loading}
            folders={folders}
            documents={documents}
            links={links}
            canManage={canManage}
            onOpenFolder={openFolder}
            onRenameFolder={(folder) => {
              const name = window.prompt(t("documents.renameFolderPrompt"), folder.name);
              if (name?.trim()) void library.renameFolder(folder, name.trim());
            }}
            onDeleteFolder={(folder) => {
              if (window.confirm(t("documents.confirmDeleteFolder", { name: folder.name })))
                void library.removeFolder(folder);
            }}
            onDownload={(document) => void download(document)}
            onDeleteDocument={(document) => {
              if (window.confirm(t("documents.confirmRemoveDocument", { name: document.name })))
                void library.removeDocument(document);
            }}
            onDeleteLink={(link) => {
              if (window.confirm(t("documents.confirmRemoveLink", { name: link.name })))
                void library.removeLink(link);
            }}
          />
          <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-400">
            <span>
              {t("documents.footerCounts", {
                folders: folders.length,
                documents: documents.length,
                links: links.length,
              })}
            </span>
            <span>{t("documents.footerNote")}</span>
          </footer>
        </section>
      </div>
    </main>
  );
}

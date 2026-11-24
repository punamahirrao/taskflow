import { DocumentBreadcrumbs } from "../breadcrumbs/DocumentBreadcrumbs";
import { DocumentCreationForms } from "../creation-forms/DocumentCreationForms";
import { DocumentLibraryContent } from "../content/DocumentLibraryContent";
import { DocumentToolbar } from "../toolbar/DocumentToolbar";
import { DocumentUploadHint } from "./DocumentUploadHint";
import { DocumentLibraryFooter } from "./DocumentLibraryFooter";

import type { useDocumentLibraryPageModel } from "../../features/library/useDocumentLibraryPageModel";
export function DocumentLibraryWorkspace({
  model,
}: {
  model: ReturnType<typeof useDocumentLibraryPageModel>;
}) {
  const {
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
  } = model;
  return (
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
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (location !== "all" && event.dataTransfer.files.length)
            void library.uploadFiles(Array.from(event.dataTransfer.files));
        }}
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
        {location !== "all" && <DocumentUploadHint model={model} />}
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
        <DocumentLibraryFooter model={model} />
      </section>
    </div>
  );
}

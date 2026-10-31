import { useMemo, useState, type DragEvent } from "react";
import { downloadDocument } from "../api/documents";
import type { DocumentFolder, DocumentLocation, WorkspaceDocument } from "../entities/document";
import { DocumentBreadcrumbs, type DocumentCrumb } from "../features/documents/components/DocumentBreadcrumbs";
import { DocumentCreationForms } from "../features/documents/components/DocumentCreationForms";
import { DocumentLibraryContent } from "../features/documents/components/DocumentLibraryContent";
import { DocumentToolbar } from "../features/documents/components/DocumentToolbar";
import { useDocuments } from "../features/documents/hooks/useDocuments";
import { useProjectContext } from "../features/projects/context/useProjectContext";
import { getStoredUser } from "../store/auth";
import type { User } from "../entities/user";

export default function DocumentsPage() {
  const { projects } = useProjectContext();
  const user = getStoredUser<User>();
  const [location, setLocation] = useState<DocumentLocation>("all");
  const [path, setPath] = useState<DocumentCrumb[]>([]);
  const [search, setSearch] = useState("");
  const [newFolder, setNewFolder] = useState(false);
  const [newLink, setNewLink] = useState(false);
  const [dragging, setDragging] = useState(false);
  const library = useDocuments(location, path.at(-1)?.id ?? null);
  const currentProject = typeof location === "number" ? projects.find((project) => project.id === location) ?? null : null;
  const canManage = (ownerId: number | null) => Boolean((ownerId && ownerId === user?.id) || currentProject?.my_role === "owner" || currentProject?.my_role === "admin");
  const folders = useMemo(() => library.folders.filter((folder) => folder.name.toLowerCase().includes(search.toLowerCase())), [library.folders, search]);
  const documents = useMemo(() => library.documents.filter((document) => document.name.toLowerCase().includes(search.toLowerCase())), [library.documents, search]);
  const links = useMemo(() => library.links.filter((link) => `${link.name} ${link.url}`.toLowerCase().includes(search.toLowerCase())), [library.links, search]);

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

  async function download(document: WorkspaceDocument) {
    try {
      const blob = await downloadDocument(document.id);
      const url = URL.createObjectURL(blob);
      const anchor = window.document.createElement("a");
      anchor.href = url;
      anchor.download = document.name;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      library.setError(cause instanceof Error ? cause.message : "Unable to download this file.");
    }
  }

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    if (location !== "all" && event.dataTransfer.files.length) void library.uploadFiles(Array.from(event.dataTransfer.files));
  }

  return <main className="min-h-screen bg-[#f7f7fb] p-5 md:p-8"><div className="mx-auto max-w-[1440px]">
    <DocumentToolbar projects={projects} location={location} busy={library.busy} onLocationChange={changeLocation} onNewFolder={() => setNewFolder((value) => !value)} onNewLink={() => setNewLink((value) => !value)} onFiles={(files) => void library.uploadFiles(Array.from(files))} />
    <section onDragEnter={(event) => { event.preventDefault(); if (location !== "all") setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={onDrop} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${dragging ? "border-sky-400 ring-4 ring-sky-100" : "border-slate-200"}`}>
      <DocumentBreadcrumbs location={location} currentProject={currentProject} path={path} search={search} onRoot={() => { setPath([]); setLocation("all"); }} onScopeRoot={() => setPath([])} onCrumb={(index) => setPath((current) => current.slice(0, index + 1))} onSearch={setSearch} />
      <DocumentCreationForms showFolder={newFolder} showLink={newLink} busy={library.busy} personal={location === "personal"} onCreateFolder={library.createFolder} onSaveLink={library.saveLink} onCloseFolder={() => setNewFolder(false)} onCloseLink={() => setNewLink(false)} />
      {library.error && <p role="alert" className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-700">{library.error}</p>}
      {location === "all" && <p className="border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[11px] text-slate-500">Browse all project and private files. Choose a location above to create folders or upload.</p>}
      {location !== "all" && <div className={`border-b border-slate-100 px-5 py-3 text-xs ${dragging ? "bg-sky-50 text-sky-800" : "bg-slate-50/70 text-slate-500"}`}>{dragging ? "Drop files to upload them here" : library.busy ? "Saving your files…" : "Drop files here to upload, or use the Upload button. Files up to 25 MB are supported."}</div>}
      <DocumentLibraryContent loading={library.loading} folders={folders} documents={documents} links={links} canManage={canManage} onOpenFolder={openFolder} onRenameFolder={(folder) => { const name = window.prompt("Rename folder", folder.name); if (name?.trim()) void library.renameFolder(folder, name.trim()); }} onDeleteFolder={(folder) => { if (window.confirm(`Delete the empty folder “${folder.name}”?`)) void library.removeFolder(folder); }} onDownload={(document) => void download(document)} onDeleteDocument={(document) => { if (window.confirm(`Remove “${document.name}” from Documents?`)) void library.removeDocument(document); }} onDeleteLink={(link) => { if (window.confirm(`Remove the saved link “${link.name}”?`)) void library.removeLink(link); }} />
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[10px] text-slate-400"><span>{folders.length} folders · {documents.length} files · {links.length} saved links</span><span>Project documents are shared with project members. Private files stay yours.</span></footer>
    </section>
  </div></main>;
}

import { useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Download, ExternalLink, File, FileText, Folder, FolderPlus, HardDrive, Link2, MoreHorizontal, Search, Trash2, Upload, X } from "lucide-react";
import { downloadDocument } from "../api/documents";
import type { DocumentFolder, DocumentLocation, WorkspaceDocument } from "../entities/document";
import { useDocuments } from "../features/documents/hooks/useDocuments";
import { useProjectContext } from "../features/projects/context/useProjectContext";
import { getStoredUser } from "../store/auth";
import type { User } from "../entities/user";

type Crumb = { id: number; name: string };

export default function DocumentsPage() {
  const { projects } = useProjectContext();
  const user = getStoredUser<User>();
  const [location, setLocation] = useState<DocumentLocation>("all");
  const [path, setPath] = useState<Crumb[]>([]);
  const [search, setSearch] = useState("");
  const [newFolder, setNewFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [newLink, setNewLink] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const library = useDocuments(location, path.at(-1)?.id ?? null);
  const currentProject = typeof location === "number" ? projects.find((project) => project.id === location) : null;
  const canManage = (ownerId: number | null) => Boolean((ownerId && ownerId === user?.id) || currentProject?.my_role === "owner" || currentProject?.my_role === "admin");
  const folders = useMemo(() => library.folders.filter((folder) => folder.name.toLowerCase().includes(search.toLowerCase())), [library.folders, search]);
  const documents = useMemo(() => library.documents.filter((document) => document.name.toLowerCase().includes(search.toLowerCase())), [library.documents, search]);
  const links = useMemo(() => library.links.filter((link) => `${link.name} ${link.url}`.toLowerCase().includes(search.toLowerCase())), [library.links, search]);

  function changeLocation(value: string) {
    setLocation(value === "all" ? "all" : value === "personal" ? "personal" : Number(value));
    setPath([]); setSearch("");
  }

  function openFolder(folder: DocumentFolder) {
    if (location === "all") setLocation(folder.project ?? "personal");
    setPath((current) => [...current, { id: folder.id, name: folder.name }]);
    setSearch("");
  }

  function goToCrumb(index: number) { setPath((current) => current.slice(0, index + 1)); }

  async function saveFolder() {
    if (!folderName.trim()) return;
    await library.createFolder(folderName.trim());
    if (!library.error) { setFolderName(""); setNewFolder(false); }
  }

  async function saveResource() {
    if (!linkName.trim() || !linkUrl.trim()) return;
    await library.saveLink(linkName.trim(), linkUrl.trim());
    if (!library.error) { setLinkName(""); setLinkUrl(""); setNewLink(false); }
  }

  async function handleFiles(files: FileList | File[]) {
    await library.uploadFiles(Array.from(files));
    if (inputRef.current) inputRef.current.value = "";
  }

  async function saveFileLocally(document: WorkspaceDocument) {
    try {
      const blob = await downloadDocument(document.id);
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url; link.download = document.name; link.click();
      URL.revokeObjectURL(url);
    } catch (cause) { library.setError(cause instanceof Error ? cause.message : "Unable to download this file."); }
  }

  function onDrop(event: DragEvent<HTMLElement>) { event.preventDefault(); setDragging(false); if (location !== "all" && event.dataTransfer.files.length) void handleFiles(event.dataTransfer.files); }
  function onFileChange(event: ChangeEvent<HTMLInputElement>) { if (event.target.files?.length) void handleFiles(event.target.files); }

  return <main className="min-h-screen bg-[#f7f7fb] p-5 md:p-8"><div className="mx-auto max-w-[1440px]">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-600">Keep work close to the team</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Documents</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">A shared library for project files and a private space for your own working documents.</p></div><div className="flex flex-wrap items-center gap-2"><label htmlFor="document-location" className="sr-only">Document location</label><select id="document-location" value={String(location)} onChange={(event) => changeLocation(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"><option value="all">All locations</option><option value="personal">My files · private</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><button type="button" onClick={() => setNewFolder((value) => !value)} disabled={location === "all" || library.busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><FolderPlus size={16} />New folder</button><button type="button" onClick={() => setNewLink((value) => !value)} disabled={location === "all" || library.busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Link2 size={16} />Save link</button><button type="button" onClick={() => inputRef.current?.click()} disabled={location === "all" || library.busy} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"><Upload size={16} />Upload</button><input ref={inputRef} type="file" multiple className="hidden" onChange={onFileChange} /></div></header>
    <section onDragEnter={(event) => { event.preventDefault(); if (location !== "all") setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setDragging(false); }} onDrop={onDrop} className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${dragging ? "border-sky-400 ring-4 ring-sky-100" : "border-slate-200"}`}>
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 md:px-5"><HardDrive size={16} className="text-slate-400" /><button type="button" onClick={() => { setPath([]); setLocation("all"); }} className={`text-xs ${!path.length && location === "all" ? "font-semibold text-slate-900" : "text-sky-700 hover:underline"}`}>All locations</button>{location !== "all" && <><span className="text-slate-300">/</span><button type="button" onClick={() => setPath([])} className={`text-xs ${!path.length ? "font-semibold text-slate-900" : "text-sky-700 hover:underline"}`}>{location === "personal" ? "My files" : currentProject?.name ?? "Project files"}</button></>}{path.map((crumb, index) => <span key={crumb.id} className="inline-flex items-center gap-2"><span className="text-slate-300">/</span><button type="button" onClick={() => goToCrumb(index)} className={`text-xs ${index === path.length - 1 ? "font-semibold text-slate-900" : "text-sky-700 hover:underline"}`}>{crumb.name}</button></span>)}<div className="relative ml-auto"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search documents" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this folder" className="w-48 rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-sky-100" /></div></div>
      {newFolder && <form onSubmit={(event) => { event.preventDefault(); void saveFolder(); }} className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-sky-50/60 px-5 py-3"><FolderPlus size={16} className="text-sky-600" /><input autoFocus value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="Folder name" aria-label="New folder name" className="min-w-52 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /><button disabled={library.busy || !folderName.trim()} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Create folder</button><button type="button" onClick={() => { setNewFolder(false); setFolderName(""); }} className="rounded-lg p-2 text-slate-400 hover:bg-white" aria-label="Cancel"><X size={15} /></button>{location === "personal" && <span className="text-[10px] text-slate-500">Only you can access this folder.</span>}</form>}
      {newLink && <form onSubmit={(event) => { event.preventDefault(); void saveResource(); }} className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-indigo-50/60 px-5 py-3"><Link2 size={16} className="text-indigo-600" /><input autoFocus value={linkName} onChange={(event) => setLinkName(event.target.value)} placeholder="Resource name" aria-label="Resource name" className="min-w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /><input type="url" required value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://…" aria-label="Resource URL" className="min-w-64 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /><button disabled={library.busy || !linkName.trim() || !linkUrl.trim()} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Save resource</button><button type="button" onClick={() => { setNewLink(false); setLinkName(""); setLinkUrl(""); }} className="rounded-lg p-2 text-slate-400 hover:bg-white" aria-label="Cancel"><X size={15} /></button><span className="w-full pl-6 text-[10px] text-slate-500">Save quick links to project tools, specifications, dashboards, or team references.</span></form>}
      {library.error && <p role="alert" className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-700">{library.error}</p>}
      {location === "all" && <p className="border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-[11px] text-slate-500">Browse all project and private files. Choose a location above to create folders or upload.</p>}
      {location !== "all" && <div className={`border-b border-slate-100 px-5 py-3 text-xs ${dragging ? "bg-sky-50 text-sky-800" : "bg-slate-50/70 text-slate-500"}`}>{dragging ? "Drop files to upload them here" : library.busy ? "Saving your files…" : "Drop files here to upload, or use the Upload button. Files up to 25 MB are supported."}</div>}
      {library.loading ? <div className="p-14 text-center text-sm text-slate-500">Opening your document library…</div> : !folders.length && !documents.length && !links.length ? <div className="p-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600"><Folder size={21} /></div><h3 className="mt-3 font-semibold text-slate-900">Nothing here yet</h3><p className="mt-1 text-sm text-slate-500">Create a folder, save a resource link, or upload files to start building your library.</p></div> : <div className="divide-y divide-slate-100">{folders.map((folder) => <FolderRow key={folder.id} folder={folder} canManage={canManage(folder.owner)} onOpen={() => openFolder(folder)} onRename={() => { const next = window.prompt("Rename folder", folder.name); if (next?.trim()) void library.renameFolder(folder, next.trim()); }} onDelete={() => { if (window.confirm(`Delete the empty folder “${folder.name}”?`)) void library.removeFolder(folder); }} />)}{links.map((link) => <ResourceRow key={`link-${link.id}`} name={link.name} url={link.url} location={link.project_name ?? "My private links"} canManage={canManage(link.owner)} onDelete={() => { if (window.confirm(`Remove the saved link “${link.name}”?`)) void library.removeLink(link); }} />)}{documents.map((document) => <FileRow key={document.id} document={document} canManage={canManage(document.owner)} onDownload={() => void saveFileLocally(document)} onDelete={() => { if (window.confirm(`Remove “${document.name}” from Documents?`)) void library.removeDocument(document); }} />)}</div>}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 text-[10px] text-slate-400"><span>{folders.length} folders · {documents.length} files · {links.length} saved links</span><span>Project documents are shared with project members. Private files stay yours.</span></footer>
    </section>
  </div></main>;
}

function FolderRow({ folder, canManage, onOpen, onRename, onDelete }: { folder: DocumentFolder; canManage: boolean; onOpen: () => void; onRename: () => void; onDelete: () => void }) {
  return <div className="group flex items-center gap-3 px-4 py-3 hover:bg-slate-50 md:px-5"><button type="button" onClick={onOpen} className="flex min-w-0 flex-1 items-center gap-3 text-left"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600"><Folder size={17} /></span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-800">{folder.name}</span><span className="block text-[10px] text-slate-400">{folder.project_name ?? "Private folder"}</span></span></button><span className="hidden text-xs text-slate-400 sm:block">Folder · {folder.owner_name}</span>{canManage && <details className="relative"><summary aria-label={`Folder actions for ${folder.name}`} className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-slate-400 hover:bg-white hover:text-slate-700"><MoreHorizontal size={17} /></summary><div className="absolute right-0 z-20 mt-1 w-36 rounded-lg border border-slate-200 bg-white p-1 shadow-lg"><button type="button" onClick={onRename} className="w-full rounded px-2 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50">Rename</button><button type="button" onClick={onDelete} className="w-full rounded px-2 py-1.5 text-left text-xs text-rose-600 hover:bg-rose-50">Delete empty folder</button></div></details>}</div>;
}

function FileRow({ document, canManage, onDownload, onDelete }: { document: WorkspaceDocument; canManage: boolean; onDownload: () => void; onDelete: () => void }) {
  return <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 md:px-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600">{document.content_type.startsWith("text/") || document.content_type.includes("pdf") ? <FileText size={17} /> : <File size={17} />}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{document.name}</span><span className="block truncate text-[10px] text-slate-400">{document.project_name ?? "My private files"} · {document.owner_name}</span></span><span className="hidden text-xs text-slate-400 sm:block">{formatSize(document.size)}</span><span className="hidden text-xs text-slate-400 md:block">{new Date(document.updated_at).toLocaleDateString()}</span><button type="button" onClick={onDownload} title={`Download ${document.name}`} aria-label={`Download ${document.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-sky-50 hover:text-sky-700"><Download size={16} /></button>{canManage && <button type="button" onClick={onDelete} title={`Delete ${document.name}`} aria-label={`Delete ${document.name}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>}</div>;
}

function ResourceRow({ name, url, location, canManage, onDelete }: { name: string; url: string; location: string; canManage: boolean; onDelete: () => void }) {
  return <div className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 md:px-5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600"><Link2 size={17} /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-800">{name}</span><span className="block truncate text-[10px] text-slate-400">{url}</span></span><span className="hidden text-xs text-slate-400 sm:block">{location}</span><a href={url} target="_blank" rel="noopener noreferrer" title={`Open ${name}`} aria-label={`Open ${name} in new tab`} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-700"><ExternalLink size={16} /></a>{canManage && <button type="button" onClick={onDelete} title={`Remove ${name}`} aria-label={`Remove ${name}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>}</div>;
}

function formatSize(size: number) { if (size < 1024) return `${size} B`; if (size < 1024 * 1024) return `${(size / 1024).toFixed(0)} KB`; return `${(size / (1024 * 1024)).toFixed(1)} MB`; }

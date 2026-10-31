import { useState } from "react";
import { FolderPlus, Link2, X } from "lucide-react";

export function DocumentCreationForms({ showFolder, showLink, busy, personal, onCreateFolder, onSaveLink, onCloseFolder, onCloseLink }: {
  showFolder: boolean; showLink: boolean; busy: boolean; personal: boolean;
  onCreateFolder: (name: string) => Promise<boolean>; onSaveLink: (name: string, url: string) => Promise<boolean>;
  onCloseFolder: () => void; onCloseLink: () => void;
}) {
  const [folderName, setFolderName] = useState("");
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  async function submitFolder() { if (await onCreateFolder(folderName.trim())) { setFolderName(""); onCloseFolder(); } }
  async function submitLink() { if (await onSaveLink(linkName.trim(), linkUrl.trim())) { setLinkName(""); setLinkUrl(""); onCloseLink(); } }
  return <>
    {showFolder && <form onSubmit={(event) => { event.preventDefault(); void submitFolder(); }} className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-sky-50/60 px-5 py-3"><FolderPlus size={16} className="text-sky-600" /><input autoFocus value={folderName} onChange={(event) => setFolderName(event.target.value)} placeholder="Folder name" aria-label="New folder name" className="min-w-52 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /><button disabled={busy || !folderName.trim()} className="rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Create folder</button><button type="button" onClick={() => { setFolderName(""); onCloseFolder(); }} className="rounded-lg p-2 text-slate-400 hover:bg-white" aria-label="Cancel"><X size={15} /></button>{personal && <span className="text-[10px] text-slate-500">Only you can access this folder.</span>}</form>}
    {showLink && <form onSubmit={(event) => { event.preventDefault(); void submitLink(); }} className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-indigo-50/60 px-5 py-3"><Link2 size={16} className="text-indigo-600" /><input autoFocus value={linkName} onChange={(event) => setLinkName(event.target.value)} placeholder="Resource name" aria-label="Resource name" className="min-w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /><input type="url" required value={linkUrl} onChange={(event) => setLinkUrl(event.target.value)} placeholder="https://…" aria-label="Resource URL" className="min-w-64 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm" /><button disabled={busy || !linkName.trim() || !linkUrl.trim()} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Save resource</button><button type="button" onClick={() => { setLinkName(""); setLinkUrl(""); onCloseLink(); }} className="rounded-lg p-2 text-slate-400 hover:bg-white" aria-label="Cancel"><X size={15} /></button><span className="w-full pl-6 text-[10px] text-slate-500">Save quick links to project tools, specifications, dashboards, or team references.</span></form>}
  </>;
}

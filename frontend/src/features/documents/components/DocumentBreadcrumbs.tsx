import { HardDrive, Search } from "lucide-react";
import type { DocumentLocation } from "../../../entities/document";
import type { Project } from "../../../entities/project";

export type DocumentCrumb = { id: number; name: string };

export function DocumentBreadcrumbs({ location, currentProject, path, search, onRoot, onScopeRoot, onCrumb, onSearch }: {
  location: DocumentLocation; currentProject: Project | null; path: DocumentCrumb[]; search: string;
  onRoot: () => void; onScopeRoot: () => void; onCrumb: (index: number) => void; onSearch: (value: string) => void;
}) {
  return <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 md:px-5"><HardDrive size={16} className="text-slate-400" /><button type="button" onClick={onRoot} className={`text-xs ${!path.length && location === "all" ? "font-semibold text-slate-900" : "text-sky-700 hover:underline"}`}>All locations</button>{location !== "all" && <><span className="text-slate-300">/</span><button type="button" onClick={onScopeRoot} className={`text-xs ${!path.length ? "font-semibold text-slate-900" : "text-sky-700 hover:underline"}`}>{location === "personal" ? "My files" : currentProject?.name ?? "Project files"}</button></>}{path.map((crumb, index) => <span key={crumb.id} className="inline-flex items-center gap-2"><span className="text-slate-300">/</span><button type="button" onClick={() => onCrumb(index)} className={`text-xs ${index === path.length - 1 ? "font-semibold text-slate-900" : "text-sky-700 hover:underline"}`}>{crumb.name}</button></span>)}<div className="relative ml-auto"><Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search documents" value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search this folder" className="w-48 rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-sky-100" /></div></div>;
}

import { useRef, type ChangeEvent } from "react";
import { FolderPlus, Link2, Upload } from "lucide-react";
import type { DocumentLocation } from "../../../common/entities/document";
import type { Project } from "../../../common/entities/project";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

interface DocumentToolbarProps {
  projects: Project[]; location: DocumentLocation; busy: boolean;
  onLocationChange: (value: string) => void; onNewFolder: () => void; onNewLink: () => void; onFiles: (files: FileList) => void;
}

export function DocumentToolbar({ projects, location, busy, onLocationChange, onNewFolder, onNewLink, onFiles }: DocumentToolbarProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  function handleFiles(event: ChangeEvent<HTMLInputElement>) { if (event.target.files?.length) onFiles(event.target.files); event.currentTarget.value = ""; }
  return <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-600">{t("documents.eyebrow")}</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{t("documents.title")}</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">{t("documents.subtitle")}</p></div><div className="flex flex-wrap items-center gap-2"><label htmlFor="document-location" className="sr-only">{t("documents.locationLabel")}</label><select id="document-location" value={String(location)} onChange={(event) => onLocationChange(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700"><option value="all">{t("documents.allLocations")}</option><option value="personal">{t("documents.myFilesPrivate")}</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select><button type="button" onClick={onNewFolder} disabled={location === "all" || busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><FolderPlus size={16} />{t("documents.newFolder")}</button><button type="button" onClick={onNewLink} disabled={location === "all" || busy} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"><Link2 size={16} />{t("documents.saveLink")}</button><button type="button" onClick={() => inputRef.current?.click()} disabled={location === "all" || busy} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"><Upload size={16} />{t("documents.upload")}</button><input ref={inputRef} type="file" multiple className="hidden" onChange={handleFiles} /></div></header>;
}

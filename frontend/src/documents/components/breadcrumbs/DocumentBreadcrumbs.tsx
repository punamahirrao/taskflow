import { HardDrive, Search } from "lucide-react";
import type { DocumentLocation } from "../../../common/entities/document";
import type { Project } from "../../../common/entities/project";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { DocumentCrumb } from "../../entities/documentLibrary";

interface DocumentBreadcrumbsProps {
  location: DocumentLocation;
  currentProject: Project | null;
  path: DocumentCrumb[];
  search: string;
  onRoot: () => void;
  onScopeRoot: () => void;
  onCrumb: (index: number) => void;
  onSearch: (value: string) => void;
}

export function DocumentBreadcrumbs({
  location,
  currentProject,
  path,
  search,
  onRoot,
  onScopeRoot,
  onCrumb,
  onSearch,
}: DocumentBreadcrumbsProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 md:px-5">
      <HardDrive size={16} className="text-slate-400" />
      <button
        type="button"
        onClick={onRoot}
        className={`text-xs ${!path.length && location === "all" ? "font-semibold text-slate-900" : "text-sky-700 hover:underline"}`}
      >
        {t("documents.allLocations")}
      </button>
      {location !== "all" && (
        <>
          <span className="text-slate-300">/</span>
          <button
            type="button"
            onClick={onScopeRoot}
            className={`text-xs ${!path.length ? "font-semibold text-slate-900" : "text-sky-700 hover:underline"}`}
          >
            {location === "personal"
              ? t("documents.myFiles")
              : (currentProject?.name ?? t("documents.projectFiles"))}
          </button>
        </>
      )}
      {path.map((crumb, index) => (
        <span key={crumb.id} className="inline-flex items-center gap-2">
          <span className="text-slate-300">/</span>
          <button
            type="button"
            onClick={() => onCrumb(index)}
            className={`text-xs ${index === path.length - 1 ? "font-semibold text-slate-900" : "text-sky-700 hover:underline"}`}
          >
            {crumb.name}
          </button>
        </span>
      ))}
      <div className="relative ml-auto">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          aria-label={t("documents.searchDocuments")}
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={t("documents.searchFolder")}
          className="w-48 rounded-lg border border-slate-200 py-1.5 pl-8 pr-2 text-xs outline-none focus:ring-2 focus:ring-sky-100"
        />
      </div>
    </div>
  );
}

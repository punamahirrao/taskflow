import { CircleHelp, Search } from "lucide-react";
import type { TranslationKey } from "../../common/entities/language";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import type { BacklogGroupBy } from "../features/agile/utils/backlog";

export type BacklogMode = "groom" | "estimate";

const GROUP_OPTIONS: [BacklogGroupBy, TranslationKey][] = [
  ["project", "backlog.project"],
  ["theme", "backlog.themeTag"],
  ["parent", "backlog.epicInitiative"],
];
interface BacklogControlsProps {
  mode: BacklogMode;
  setMode: (mode: BacklogMode) => void;
  groupBy: BacklogGroupBy;
  setGroupBy: (group: BacklogGroupBy) => void;
  search: string;
  setSearch: (value: string) => void;
}

export function BacklogControls({
  mode,
  setMode,
  groupBy,
  setGroupBy,
  search,
  setSearch,
}: BacklogControlsProps) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 md:px-5">
        <div>
          <h3 className="font-semibold text-slate-900">{t("backlog.prioritizedWork")}</h3>
          <p className="mt-0.5 text-xs text-slate-500">{t("backlog.dragHint")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            {t("backlog.group")}
            <select
              aria-label={t("backlog.groupByAria")}
              value={groupBy}
              onChange={(event) => setGroupBy(event.target.value as BacklogGroupBy)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700"
            >
              {GROUP_OPTIONS.map(([value, labelKey]) => (
                <option key={value} value={value}>
                  {t(labelKey)}
                </option>
              ))}
            </select>
          </label>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              aria-label={t("backlog.searchAria")}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("backlog.findWork")}
              className="w-44 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setMode("groom")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === "groom" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}
            >
              {t("backlog.refine")}
            </button>
            <button
              type="button"
              onClick={() => setMode("estimate")}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === "estimate" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}
            >
              {t("backlog.estimate")}
            </button>
          </div>
        </div>
      </div>
      {mode === "estimate" && (
        <div className="flex gap-2 border-b border-violet-100 bg-violet-50 px-5 py-3 text-xs text-violet-800">
          <CircleHelp size={15} className="shrink-0" />
          <p>{t("backlog.estimationMode")}</p>
        </div>
      )}
    </>
  );
}

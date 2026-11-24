import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Search, Filter } from "lucide-react";
import type { BacklogDrawerProps } from "../../entities/backlogDrawer";

export function BacklogDrawerFilters({
  backlogSearch,
  readyOnly,
  onSearchChange,
  onToggleReady,
}: Pick<BacklogDrawerProps, "backlogSearch" | "readyOnly" | "onSearchChange" | "onToggleReady">) {
  const { t } = useTranslation();
  return (
    <>
      <div className="mt-3 flex gap-2">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t("sprintTrain.searchBacklog")}</span>
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={backlogSearch}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder={t("sprintTrain.searchBacklogPlaceholder")}
            className="sprint-backlog-search w-full rounded-lg border py-2 pl-9 pr-3 text-sm placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none"
          />
        </label>
        <button
          type="button"
          aria-pressed={readyOnly}
          aria-label={t("sprintTrain.toggleReadyFilter")}
          onClick={onToggleReady}
          className={`sprint-backlog-filter grid size-10 shrink-0 place-items-center rounded-lg border ${readyOnly ? "border-indigo-500 bg-indigo-600 text-white" : "text-slate-500"}`}
        >
          <Filter size={16} />
        </button>
      </div>
      {readyOnly && (
        <p className="mt-2 text-[calc(10px*var(--taskflow-font-scale,1))] text-indigo-200">
          {t("sprintTrain.readyFilterActive")}
        </p>
      )}
    </>
  );
}

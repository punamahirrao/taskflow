import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import type { TranslationKey } from "../../common/entities/language";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import type { BoardTab } from "../utils/boardDashboard";

type SortKey = "updated" | "name" | "tasks" | "sprints";
interface Props {
  search: string;
  type: string;
  sort: SortKey;
  tab: BoardTab;
  onSearch: (value: string) => void;
  onType: (value: string) => void;
  onSort: (value: SortKey) => void;
  onTab: (value: BoardTab) => void;
}
const tabs: [Props["tab"], TranslationKey][] = [
  ["all", "boards.allBoards"],
  ["mine", "boards.myBoards"],
  ["shared", "boards.sharedBoards"],
  ["archived", "boards.archived"],
];
export function BoardFilters({ search, type, sort, tab, onSearch, onType, onSort, onTab }: Props) {
  const { t } = useTranslation();
  const stop = (fn: (value: string) => void) => (event: ChangeEvent<HTMLSelectElement>) =>
    fn(event.target.value);
  return (
    <div className="mb-5 flex flex-wrap items-center gap-3">
      <div className="flex gap-4 border-b border-line">
        {tabs.map(([value, labelKey]) => (
          <button
            key={value}
            type="button"
            aria-pressed={tab === value}
            onClick={() => onTab(value)}
            className={`border-b-2 px-1 pb-2 text-sm font-semibold ${tab === value ? "border-accent text-accent" : "border-transparent text-muted"}`}
          >
            {t(labelKey)}
          </button>
        ))}
      </div>
      <div className="ml-auto flex flex-wrap gap-2">
        <label data-testid="board-search-label" className="relative">
          <span className="sr-only">{t("boards.searchBoards")}</span>
          <Search
            size={15}
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            data-testid="board-search-input"
            type="search"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder={t("boards.searchBoards")}
            className="w-56 rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm text-content"
          />
        </label>
        <label
          data-testid="board-type-filter-label"
          className="flex flex-col gap-1 text-xs font-semibold text-muted"
        >
          <span className="sr-only">{t("boards.filterType")}</span>
          <select
            data-testid="board-type-filter-input"
            aria-label={t("boards.filterType")}
            value={type}
            onChange={stop(onType)}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content"
          >
            <option value="all">{t("boards.allTypes")}</option>
            <option value="scrum">Scrum</option>
            <option value="kanban">Kanban</option>
          </select>
        </label>
        <label
          data-testid="board-sort-label"
          className="flex flex-col gap-1 text-xs font-semibold text-muted"
        >
          <span className="sr-only">{t("boards.sortBoards")}</span>
          <select
            data-testid="board-sort-input"
            aria-label={t("boards.sortBoards")}
            value={sort}
            onChange={stop((value) => onSort(value as SortKey))}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content"
          >
            <option value="updated">{t("boards.sortRecentlyUpdated")}</option>
            <option value="name">{t("boards.sortName")}</option>
            <option value="tasks">{t("boards.sortTasks")}</option>
            <option value="sprints">{t("boards.sortSprints")}</option>
          </select>
        </label>
      </div>
    </div>
  );
}

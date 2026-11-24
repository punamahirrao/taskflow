import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BoardSortKey } from "../../utils/boardDashboard";
import type { BoardFiltersProps } from "../../entities/boardFilters";

export function BoardSortSelect({ sort, onSort }: Pick<BoardFiltersProps, "sort" | "onSort">) {
  const { t } = useTranslation();
  return (
    <label
      data-testid="board-sort-label"
      className="flex flex-col gap-1 text-xs font-semibold text-muted"
    >
      <span className="sr-only">{t("boards.sortBoards")}</span>
      <select
        data-testid="board-sort-input"
        aria-label={t("boards.sortBoards")}
        value={sort}
        onChange={(event) => onSort(event.target.value as BoardSortKey)}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content"
      >
        <option value="updated">{t("boards.sortRecentlyUpdated")}</option>
        <option value="name">{t("boards.sortName")}</option>
        <option value="tasks">{t("boards.sortTasks")}</option>
        <option value="sprints">{t("boards.sortSprints")}</option>
      </select>
    </label>
  );
}

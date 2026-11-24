import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BoardFiltersProps } from "../../entities/boardFilters";

export function BoardTypeFilter({ type, onType }: Pick<BoardFiltersProps, "type" | "onType">) {
  const { t } = useTranslation();
  return (
    <label
      data-testid="board-type-filter-label"
      className="flex flex-col gap-1 text-xs font-semibold text-muted"
    >
      <span className="sr-only">{t("boards.filterType")}</span>
      <select
        data-testid="board-type-filter-input"
        aria-label={t("boards.filterType")}
        value={type}
        onChange={(event) => onType(event.target.value)}
        className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content"
      >
        <option value="all">{t("boards.allTypes")}</option>
        <option value="scrum">Scrum</option>
        <option value="kanban">Kanban</option>
      </select>
    </label>
  );
}

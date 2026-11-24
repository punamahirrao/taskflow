import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Search } from "lucide-react";
import type { BoardFiltersProps } from "../../entities/boardFilters";

export function BoardDirectorySearch({
  search,
  onSearch,
}: Pick<BoardFiltersProps, "search" | "onSearch">) {
  const { t } = useTranslation();
  return (
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
  );
}

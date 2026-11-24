import type { BoardFiltersProps } from "../../entities/boardFilters";
import { BoardFiltersLayout } from "../../components/directory-filters/BoardFiltersLayout";
import { BoardFilterActions } from "../../components/directory-filters/BoardFilterActions";
import { BoardFilterTabs } from "../../components/directory-filters/BoardFilterTabs";
import { BoardDirectorySearch } from "../../components/directory-filters/BoardDirectorySearch";
import { BoardTypeFilter } from "../../components/directory-filters/BoardTypeFilter";
import { BoardSortSelect } from "../../components/directory-filters/BoardSortSelect";

export function BoardFilters({
  search,
  type,
  sort,
  tab,
  onSearch,
  onType,
  onSort,
  onTab,
}: BoardFiltersProps) {
  return (
    <BoardFiltersLayout>
      <BoardFilterTabs tab={tab} onTab={onTab} />
      <BoardFilterActions>
        <BoardDirectorySearch search={search} onSearch={onSearch} />
        <BoardTypeFilter type={type} onType={onType} />
        <BoardSortSelect sort={sort} onSort={onSort} />
      </BoardFilterActions>
    </BoardFiltersLayout>
  );
}

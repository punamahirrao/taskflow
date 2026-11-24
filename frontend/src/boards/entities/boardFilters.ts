import type { BoardSortKey, BoardTab } from "../utils/boardDashboard";

export interface BoardFiltersProps {
  search: string;
  type: string;
  sort: BoardSortKey;
  tab: BoardTab;
  onSearch: (value: string) => void;
  onType: (value: string) => void;
  onSort: (value: BoardSortKey) => void;
  onTab: (value: BoardTab) => void;
}

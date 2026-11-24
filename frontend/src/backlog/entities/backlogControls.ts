import type { BacklogGroupBy } from "../features/agile/utils/backlog";

export type BacklogMode = "groom" | "estimate";
export interface BacklogControlsProps {
  mode: BacklogMode;
  setMode: (mode: BacklogMode) => void;
  groupBy: BacklogGroupBy;
  setGroupBy: (group: BacklogGroupBy) => void;
  search: string;
  setSearch: (value: string) => void;
}

import type { BoardColumn } from "../../common/entities/task";

export interface ProjectOption {
  id: number;
  name: string;
}

export interface BoardColumnGroup {
  name: string;
  columns: BoardColumn[];
}

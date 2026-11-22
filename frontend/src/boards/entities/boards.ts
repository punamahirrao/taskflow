import type { BoardColumn } from "../../features/tasks/entities/task";

export interface ProjectOption {
  id: number;
  name: string;
}

export interface BoardColumnGroup {
  name: string;
  columns: BoardColumn[];
}

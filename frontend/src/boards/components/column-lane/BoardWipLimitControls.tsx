import type { BoardColumn } from "../../../features/tasks/entities/task";
import { BoardWipLimitField } from "./BoardWipLimitField";

export function BoardWipLimitControls({
  columns,
  busy,
  onSaveLimit,
}: {
  columns: BoardColumn[];
  busy: boolean;
  onSaveLimit: (column: BoardColumn, value: string) => void;
}) {
  return (
    <div className="mb-2 space-y-1">
      {columns.map((column) => (
        <BoardWipLimitField key={column.id} column={column} busy={busy} onSaveLimit={onSaveLimit} />
      ))}
    </div>
  );
}

import { groupBoardTasks } from "../../../common/features/agile/utils/boardView";
import type { BoardColumnLaneProps } from "../../entities/columnLane";
import { BoardColumnLayout } from "../../components/column-lane/BoardColumnLayout";
import { BoardColumnHeader } from "../../components/column-lane/BoardColumnHeader";
import { BoardWipLimitControls } from "../../components/column-lane/BoardWipLimitControls";
import { BoardWipWarning } from "../../components/column-lane/BoardWipWarning";
import { BoardColumnBody } from "../../components/column-lane/BoardColumnBody";
import { BoardColumnDropZone } from "../../components/column-lane/BoardColumnDropZone";
import { BoardColumnTaskStack } from "../../components/column-lane/BoardColumnTaskStack";
import { BoardSwimlane } from "../../components/column-lane/BoardSwimlane";
import { BoardColumnEmptyState } from "../../components/column-lane/BoardColumnEmptyState";

export function BoardColumnLane({
  groupName,
  columns,
  tasks,
  swimlane,
  projects,
  projectSelected,
  canCustomize,
  busy,
  overLimit,
  aggregateLimit,
  onSaveLimit,
  onMove,
  renderTask,
}: BoardColumnLaneProps) {
  const representative = columns[0];
  if (!representative) return null;
  const statuses = columns.flatMap(
    (column) =>
      column.statuses ?? [
        { id: 0, key: column.key, name: column.name, position: 0, is_system: true },
      ],
  );
  const uniqueStatuses = [...new Map(statuses.map((status) => [status.key, status])).values()];
  const columnTasks = tasks.filter((task) =>
    uniqueStatuses.some((status) => status.key === task.status),
  );
  const groupLimit = columns.reduce((sum, column) => sum + (column.wip_limit ?? 0), 0);
  const limitLabel = projectSelected
    ? groupLimit
      ? ` / ${groupLimit}`
      : ""
    : aggregateLimit
      ? ` / ${aggregateLimit}`
      : "";
  const lanes = uniqueStatuses.length ? groupBoardTasks(columnTasks, swimlane, projects) : [];
  return (
    <BoardColumnLayout name={groupName}>
      <BoardColumnHeader
        name={groupName}
        stage={representative.key}
        count={tasks.length}
        limitLabel={limitLabel}
        overLimit={overLimit}
      />
      {canCustomize && projectSelected && (
        <BoardWipLimitControls columns={columns} busy={busy} onSaveLimit={onSaveLimit} />
      )}
      {overLimit && <BoardWipWarning />}
      <BoardColumnBody>
        {uniqueStatuses.length ? (
          <BoardColumnDropZone status={uniqueStatuses[0].key} onMove={onMove}>
            <BoardColumnTaskStack>
              {lanes.map(([lane, name, laneTasks]) => (
                <BoardSwimlane
                  key={lane}
                  name={name}
                  showName={swimlane !== "project" || !projectSelected}
                >
                  {laneTasks.map(renderTask)}
                </BoardSwimlane>
              ))}
            </BoardColumnTaskStack>
          </BoardColumnDropZone>
        ) : (
          <BoardColumnEmptyState />
        )}
      </BoardColumnBody>
    </BoardColumnLayout>
  );
}

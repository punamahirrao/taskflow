import type { ReactNode } from "react";
import type { BoardColumn, Task } from "../../features/tasks/entities/task";
import { groupBoardTasks, type Swimlane } from "../../common/features/agile/utils/boardView";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import type { ProjectOption } from "../entities/boards";

interface BoardColumnLaneProps {
  groupName: string;
  columns: BoardColumn[];
  tasks: Task[];
  swimlane: Swimlane;
  projects: ProjectOption[];
  projectSelected: boolean;
  canCustomize: boolean;
  busy: boolean;
  overLimit: boolean;
  aggregateLimit: number;
  onSaveLimit: (column: BoardColumn, value: string) => void;
  onMove: (taskId: number, status: string) => void;
  renderTask: (task: Task) => ReactNode;
}

const STAGE_TONES: Record<string, string> = {
  backlog: "bg-muted",
  todo: "bg-accent",
  in_progress: "bg-info",
  review: "bg-warning",
  waiting: "bg-warning",
  done: "bg-positive",
};

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
  const { t } = useTranslation();
  const representative = columns[0];
  if (!representative) return null;
  const statuses = columns.flatMap((column) =>
    column.statuses ?? [
      { id: 0, key: column.key, name: column.name, position: 0, is_system: true },
    ],
  );
  const uniqueStatuses = [...new Map(statuses.map((status) => [status.key, status])).values()];
  const columnTasks = tasks.filter((task) => uniqueStatuses.some((status) => status.key === task.status));
  const groupLimit = columns.reduce((sum, column) => sum + (column.wip_limit ?? 0), 0);
  const limitLabel = projectSelected
    ? groupLimit
      ? ` / ${groupLimit}`
      : ""
    : aggregateLimit
      ? ` / ${aggregateLimit}`
      : "";
  return (
    <section
      aria-label={t("boards.columnAria", { name: groupName })}
      className="flex h-full min-w-0 flex-col rounded-xl border border-line bg-subtle/80 p-2.5 transition hover:border-accent/30"
    >
      <header className="mb-2 flex items-center gap-2 px-1 py-1">
        <span
          className={`h-2 w-2 rounded-full ${STAGE_TONES[representative.key] ?? "bg-accent"}`}
        />
        <h3 className="text-xs font-bold uppercase tracking-wide text-content">{groupName}</h3>
        <span
          className={`ml-auto rounded-full px-2 py-0.5 text-[calc(10px*var(--taskflow-font-scale,1))] font-bold ${overLimit ? "bg-danger-soft text-danger" : "bg-surface text-muted"}`}
        >
          {tasks.length}
          {limitLabel}
        </span>
      </header>
      {canCustomize && projectSelected && (
        <div className="mb-2 space-y-1">
          {columns.map((column) => (
            <label
              key={column.id}
              data-testid={`wip-limit-${column.id}-label`}
              className="flex items-center justify-end gap-1 px-1 text-[calc(10px*var(--taskflow-font-scale,1))] text-muted"
            >
              {column.name} {t("boards.wip")}
              <input
                data-testid={`wip-limit-${column.id}-input`}
                aria-label={t("boards.columnWipLimitAria", { name: column.name })}
                type="number"
                min="1"
                defaultValue={column.wip_limit ?? ""}
                key={`${column.id}-${column.wip_limit}`}
                disabled={busy}
                onBlur={(event) => onSaveLimit(column, event.target.value)}
                className="w-12 rounded border border-line bg-surface px-1 py-0.5 text-center text-[calc(10px*var(--taskflow-font-scale,1))] text-content"
              />
            </label>
          ))}
        </div>
      )}
      {overLimit && (
        <p
          role="alert"
          className="mb-2 rounded-lg border border-danger/30 bg-danger-soft px-2 py-1.5 text-[calc(10px*var(--taskflow-font-scale,1))] font-semibold text-danger"
        >
          {t("boards.wipExceeded")}
        </p>
      )}
      <div className="flex min-h-48 flex-1 flex-col gap-2">
        {uniqueStatuses.length > 0 ? (
          <section
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              onMove(Number(event.dataTransfer.getData("text/plain")), uniqueStatuses[0].key);
            }}
            className="min-h-24 flex-1 rounded-lg border border-line/80 bg-surface/70 p-2"
          >
            <div className="space-y-2">
              {groupBoardTasks(columnTasks, swimlane, projects).map(([lane, name, laneTasks]) => (
                <div key={lane} className="space-y-2">
                  {(swimlane !== "project" || !projectSelected) && (
                    <h5 className="px-1 pt-1 text-[calc(10px*var(--taskflow-font-scale,1))] font-bold uppercase tracking-wide text-muted">
                      {name}
                    </h5>
                  )}
                  {laneTasks.map(renderTask)}
                </div>
              ))}
            </div>
          </section>
        ) : (
          <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-line px-3 py-6 text-center text-[calc(11px*var(--taskflow-font-scale,1))] text-muted">
            {t("boards.noStatusesInColumn")}
          </div>
        )}
      </div>
    </section>
  );
}

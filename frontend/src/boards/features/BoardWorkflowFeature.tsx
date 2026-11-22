import { AlertTriangle } from "lucide-react";
import type { BoardColumn, Task } from "../../features/tasks/entities/task";
import type { Project } from "../../common/entities/project";
import type { Swimlane } from "../../common/features/agile/utils/boardView";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import type { CSSProperties, ReactNode } from "react";
import { BoardColumnLane } from "../components/BoardColumnLane";
import type { BoardColumnGroup } from "../entities/boards";

interface Props {
  message: string;
  error: string;
  blockedCount: number;
  loading: boolean;
  columns: BoardColumnGroup[];
  tasks: Task[];
  projectColumns: Record<number, BoardColumn[]>;
  visibleProjects: Project[];
  projects: Project[];
  projectSelected: boolean;
  swimlane: Swimlane;
  onMove: (taskId: number, status: string) => void;
  renderTask: (task: Task) => ReactNode;
}
export function BoardWorkflowFeature(props: Props) {
  const { t } = useTranslation();
  return (
    <>
      {props.blockedCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
          <AlertTriangle size={16} />
          {t(props.blockedCount === 1 ? "boards.blockedOne" : "boards.blockedMany", {
            count: props.blockedCount,
          })}
        </div>
      )}
      {props.message && (
        <p
          role="status"
          className="mb-4 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-muted shadow-sm"
        >
          {props.message}
        </p>
      )}
      {props.error && (
        <p role="alert" className="mb-4 rounded-lg bg-danger-soft px-4 py-2.5 text-sm text-danger">
          {props.error}
        </p>
      )}
      {props.loading || !props.columns.length ? (
        <div className="rounded-2xl border border-line bg-surface p-14 text-center text-sm text-muted">
          {props.loading ? t("boards.loadingFlow") : t("boards.settingUpWorkflow")}
        </div>
      ) : (
        <div
          className="board-workflow-grid grid min-h-0 w-full flex-1 items-stretch gap-3 pb-4"
          style={{ "--board-column-count": props.columns.length } as CSSProperties}
        >
          {props.columns.map((group) => {
            const tasks = props.tasks.filter((task) =>
              group.columns.some((column) =>
                column.statuses
                  ? column.statuses.some((status) => task.status === status.key)
                  : task.status === column.key,
              ),
            );
            const overLimit = props.visibleProjects.some((project) =>
              group.columns.some((column) => {
                const projectColumn = (props.projectColumns[project.id] ?? []).find(
                  (item) => item.id === column.id,
                );
                const statusKeys = column.statuses?.map((status) => status.key) ?? [column.key];
                const count = tasks.filter(
                  (task) => task.project === project.id && statusKeys.includes(task.status),
                ).length;
                return projectColumn?.wip_limit != null && count > projectColumn.wip_limit;
              }),
            );
            const aggregateLimit = props.visibleProjects.reduce(
              (total, project) =>
                total +
                group.columns.reduce(
                  (subtotal, column) =>
                    subtotal +
                    ((props.projectColumns[project.id] ?? []).find((item) => item.id === column.id)
                      ?.wip_limit ?? 0),
                  0,
                ),
              0,
            );
            return (
              <BoardColumnLane
                key={group.name}
                groupName={group.name}
                columns={group.columns}
                tasks={tasks}
                swimlane={props.swimlane}
                projects={props.projects}
                projectSelected={props.projectSelected}
                canCustomize={false}
                busy={false}
                overLimit={overLimit}
                aggregateLimit={aggregateLimit}
                onSaveLimit={() => undefined}
                onMove={props.onMove}
                renderTask={props.renderTask}
              />
            );
          })}
        </div>
      )}
    </>
  );
}

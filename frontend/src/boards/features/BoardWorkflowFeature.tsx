import { AlertTriangle, ArrowDownRight, Zap } from "lucide-react";
import type { BoardColumn, Task } from "../../common/entities/task";
import type { Project } from "../../common/entities/project";
import type { Swimlane } from "../../common/features/agile/utils/boardView";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import type { ReactNode } from "react";
import { BoardColumnLane } from "../components/BoardColumnLane";
import type { BoardColumnGroup } from "../entities/boards";

interface Props {
  message: string; error: string; blockedCount: number; sprintNotice: boolean; loading: boolean; columns: BoardColumnGroup[];
  tasks: Task[]; projectColumns: Record<number, BoardColumn[]>; visibleProjects: Project[]; projects: Project[];
  projectSelected: boolean; swimlane: Swimlane; onMove: (taskId: number, status: string) => void; renderTask: (task: Task) => ReactNode;
}
export function BoardWorkflowFeature(props: Props) {
  const { t } = useTranslation();
  return <>
    {props.blockedCount > 0 && <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger"><AlertTriangle size={16}/>{t(props.blockedCount === 1 ? "boards.blockedOne" : "boards.blockedMany", { count: props.blockedCount })}</div>}
    {props.sprintNotice && <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-accent"><Zap size={15}/>{t("boards.sprintModeNotice")}</div>}
    {props.message && <p role="status" className="mb-4 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm text-muted shadow-sm">{props.message}</p>}
    {props.error && <p role="alert" className="mb-4 rounded-lg bg-danger-soft px-4 py-2.5 text-sm text-danger">{props.error}</p>}
    {props.loading || !props.columns.length ? <div className="rounded-2xl border border-line bg-surface p-14 text-center text-sm text-muted">{props.loading ? t("boards.loadingFlow") : t("boards.settingUpWorkflow")}</div> : <div className="flex gap-4 overflow-x-auto pb-4">{props.columns.map((group) => {
      const tasks = props.tasks.filter((task) => group.columns.some((column) => column.statuses ? column.statuses.some((status) => task.status === status.key) : task.status === column.key));
      const overLimit = props.visibleProjects.some((project) => group.columns.some((column) => {
        const projectColumn = (props.projectColumns[project.id] ?? []).find((item) => item.id === column.id);
        const statusKeys = column.statuses?.map((status) => status.key) ?? [column.key];
        const count = tasks.filter((task) => task.project === project.id && statusKeys.includes(task.status)).length;
        return projectColumn?.wip_limit != null && count > projectColumn.wip_limit;
      }));
      const aggregateLimit = props.visibleProjects.reduce((total, project) => total + group.columns.reduce((subtotal, column) => subtotal + ((props.projectColumns[project.id] ?? []).find((item) => item.id === column.id)?.wip_limit ?? 0), 0), 0);
      return <BoardColumnLane key={group.name} groupName={group.name} columns={group.columns} tasks={tasks} swimlane={props.swimlane} projects={props.projects} projectSelected={props.projectSelected} canCustomize={false} busy={false} overLimit={overLimit} aggregateLimit={aggregateLimit} onSaveLimit={() => undefined} onMove={props.onMove} renderTask={props.renderTask}/>;
    })}</div>}
    {!props.loading && !props.tasks.length && <div className="mt-2 flex items-center gap-2 text-xs text-muted"><ArrowDownRight size={14}/>{t("boards.moveItemHint")}</div>}
  </>;
}

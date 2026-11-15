import type { ReactNode } from "react";
import { Layers3 } from "lucide-react";
import type { BoardColumn, Task } from "../../common/entities/task";
import { groupBoardTasks, type Swimlane } from "../../common/features/agile/utils/boardView";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import type { ProjectOption } from "../entities/boards";

interface BoardColumnLaneProps {
  groupName: string; columns: BoardColumn[]; tasks: Task[]; swimlane: Swimlane; projects: ProjectOption[];
  projectSelected: boolean; canCustomize: boolean; busy: boolean;
  overLimit: boolean; aggregateLimit: number; onSaveLimit: (column: BoardColumn, value: string) => void;
  onMove: (taskId: number, status: string) => void; renderTask: (task: Task) => ReactNode;
}

const STAGE_TONES: Record<string, string> = { backlog: "bg-muted", todo: "bg-accent", in_progress: "bg-info", review: "bg-warning", waiting: "bg-warning", done: "bg-positive" };

export function BoardColumnLane({ groupName, columns, tasks, swimlane, projects, projectSelected, canCustomize, busy, overLimit, aggregateLimit, onSaveLimit, onMove, renderTask }: BoardColumnLaneProps) {
  const { t } = useTranslation();
  const representative = columns[0];
  if (!representative) return null;
  const statuses = representative.statuses ?? [{ id: 0, key: representative.key, name: representative.name, position: 0, is_system: true }];
  const groupLimit = columns.reduce((sum, column) => sum + (column.wip_limit ?? 0), 0);
  const limitLabel = projectSelected ? (groupLimit ? ` / ${groupLimit}` : "") : aggregateLimit ? ` / ${aggregateLimit}` : "";
  return <section aria-label={t("boards.columnAria", { name: groupName })} className="w-[290px] min-w-[290px] rounded-xl border border-line bg-subtle/80 p-2.5 transition hover:border-accent/30">
    <header className="mb-2 flex items-center gap-2 px-1 py-1"><span className={`h-2 w-2 rounded-full ${STAGE_TONES[representative.key] ?? "bg-accent"}`} /><h3 className="text-xs font-bold uppercase tracking-wide text-content">{groupName}</h3><span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${overLimit ? "bg-danger-soft text-danger" : "bg-surface text-muted"}`}>{tasks.length}{limitLabel}</span></header>
    {canCustomize && projectSelected && <div className="mb-2 space-y-1">{columns.map((column) => <label key={column.id} data-testid={`wip-limit-${column.id}-label`} className="flex items-center justify-end gap-1 px-1 text-[10px] text-muted">{column.name} {t("boards.wip")}<input data-testid={`wip-limit-${column.id}-input`} aria-label={t("boards.columnWipLimitAria", { name: column.name })} type="number" min="1" defaultValue={column.wip_limit ?? ""} key={`${column.id}-${column.wip_limit}`} disabled={busy} onBlur={(event) => onSaveLimit(column, event.target.value)} className="w-12 rounded border border-line bg-surface px-1 py-0.5 text-center text-[10px] text-content" /></label>)}</div>}
    {overLimit && <p role="alert" className="mb-2 rounded-lg border border-danger/30 bg-danger-soft px-2 py-1.5 text-[10px] font-semibold text-danger">{t("boards.wipExceeded")}</p>}
    <div className="flex min-h-48 flex-col gap-2">{statuses.map((status) => { const statusTasks = tasks.filter((task) => task.status === status.key); return <section key={status.key} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onMove(Number(event.dataTransfer.getData("text/plain")), status.key); }} className="min-h-24 rounded-lg border border-line/80 bg-surface/70 p-2">{(statuses.length > 1 || status.name !== representative.name) && <header className="mb-2 flex items-center gap-2"><span className={`h-1.5 w-1.5 rounded-full ${STAGE_TONES[status.key] ?? "bg-accent"}`} /><h4 className="text-[10px] font-bold uppercase tracking-wide text-muted">{status.name}</h4><span className="ml-auto text-[10px] font-semibold text-muted">{statusTasks.length}</span></header>}<div className="space-y-2">{groupBoardTasks(statusTasks, swimlane, projects).map(([lane, name, laneTasks]) => <div key={lane} className="space-y-2">{(swimlane !== "project" || !projectSelected) && <h5 className="px-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-muted">{name}</h5>}{laneTasks.map(renderTask)}</div>)}</div></section>; })}{!statuses.length && <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-line px-3 py-6 text-center text-[11px] text-muted">{t("boards.noStatusesInColumn")}</div>}{statuses.length > 0 && !tasks.length && <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-line px-3 py-8 text-center"><Layers3 size={17} className="text-muted" /><p className="mt-2 text-[11px] text-muted">{t("boards.dropWorkHere")}</p></div>}</div>
  </section>;
}

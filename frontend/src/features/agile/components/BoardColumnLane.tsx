import type { ReactNode } from "react";
import { Layers3 } from "lucide-react";
import type { BoardColumn, Task } from "../../../entities/task";
import { STAGE_COLORS, groupBoardTasks, type Swimlane } from "../utils/boardView";

export function BoardColumnLane({ column, tasks, swimlane, projects, singleProject, projectSelected, canCustomize, busy, overLimit, aggregateLimit, onSaveLimit, onMove, renderTask }: {
  column: BoardColumn; tasks: Task[]; swimlane: Swimlane; projects: { id: number; name: string }[];
  singleProject: BoardColumn | null | undefined; projectSelected: boolean; canCustomize: boolean; busy: boolean;
  overLimit: boolean; aggregateLimit: number; onSaveLimit: (column: BoardColumn, value: string) => void;
  onMove: (taskId: number, status: string) => void; renderTask: (task: Task) => ReactNode;
}) {
  const limitLabel = singleProject?.wip_limit ? ` / ${singleProject.wip_limit}` : !projectSelected && aggregateLimit ? ` / ${aggregateLimit}` : "";
  return <section aria-label={`${column.name} column`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); onMove(Number(event.dataTransfer.getData("text/plain")), column.key); }} className="w-[290px] min-w-[290px] rounded-xl border border-slate-200 bg-slate-100/80 p-2.5 transition hover:border-violet-200">
    <header className="mb-2 flex items-center gap-2 px-1 py-1"><span className={`h-2 w-2 rounded-full ${STAGE_COLORS[column.key] ?? "bg-violet-500"}`} /><h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">{column.name}</h3><span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold ${overLimit ? "bg-rose-100 text-rose-700" : "bg-white text-slate-500"}`}>{tasks.length}{limitLabel}</span></header>
    {canCustomize && singleProject && <label className="mb-2 flex items-center justify-end gap-1 px-1 text-[10px] text-slate-400">WIP<input aria-label={`${column.name} WIP limit`} type="number" min="1" defaultValue={singleProject.wip_limit ?? ""} key={`${singleProject.id}-${singleProject.wip_limit}`} disabled={busy} onBlur={(event) => onSaveLimit(singleProject, event.target.value)} className="w-12 rounded border border-slate-200 bg-white px-1 py-0.5 text-center text-[10px] text-slate-600" /></label>}
    {overLimit && <p role="alert" className="mb-2 rounded-lg border border-rose-200 bg-rose-50 px-2 py-1.5 text-[10px] font-semibold text-rose-700">WIP limit exceeded. Consider swarming on current work before pulling more.</p>}
    <div className="flex min-h-48 flex-col gap-2">{groupBoardTasks(tasks, swimlane, projects).map(([lane, name, laneTasks]) => <div key={lane} className="space-y-2">{(swimlane !== "project" || !projectSelected) && <h4 className="px-1 pt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{name}</h4>}{laneTasks.map(renderTask)}</div>)}{!tasks.length && <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300/80 px-3 py-8 text-center"><Layers3 size={17} className="text-slate-300" /><p className="mt-2 text-[11px] text-slate-400">Drop work here</p></div>}</div>
  </section>;
}

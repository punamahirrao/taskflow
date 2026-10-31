import { ArrowDown, ArrowUp, Sparkles } from "lucide-react";
import type { Project } from "../../../entities/project";
import type { Sprint, Task } from "../../../entities/task";
import { getDefinitionOfReady, groupBacklogTasks } from "../utils/backlog";
import { WorkItemCard } from "./WorkItemCard";

type Group = ReturnType<typeof groupBacklogTasks>[number];
type Props = {
  loading: boolean;
  backlog: Task[];
  tasks: Task[];
  projects: Project[];
  groups: Group[];
  activeSprint?: Sprint;
  sprintBusy: boolean;
  epicRollups: Map<number, { done: number; total: number }>;
  onCapture: () => void;
  onReorder: (task: Task, direction: -1 | 1) => void;
  onUpdate: (taskId: number, changes: Partial<Task>) => Promise<unknown>;
  onEdit: (taskId: number) => void;
};

export function BacklogWorkList({ loading, backlog, tasks, projects, groups, activeSprint, sprintBusy, epicRollups, onCapture, onReorder, onUpdate, onEdit }: Props) {
  if (loading) return <div className="p-12 text-center text-sm text-slate-500">Loading backlog…</div>;
  if (!backlog.length) return <div className="p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Sparkles size={21} /></div><h3 className="mt-3 font-semibold text-slate-900">Your pipeline is clear</h3><p className="mt-1 text-sm text-slate-500">Capture an idea or move work back here for another round of thinking.</p><button type="button" onClick={onCapture} className="mt-4 text-sm font-semibold text-violet-700 hover:text-violet-900">Capture the next idea</button></div>;
  return <div className="space-y-6 p-4 md:p-5">{groups.map(([projectName, items, groupKey]) => <section key={groupKey} aria-label={`${projectName} backlog`}><div className="mb-3 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-500" /><h4 className="text-sm font-semibold text-slate-800">{projectName}</h4><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{items.length}</span></div><div className="space-y-2">{items.map((task) => <BacklogItem key={task.id} task={task} backlog={backlog} tasks={tasks} projects={projects} activeSprint={activeSprint} sprintBusy={sprintBusy} rollup={epicRollups.get(task.id)} onReorder={onReorder} onUpdate={onUpdate} onEdit={onEdit} />)}</div></section>)}</div>;
}

function BacklogItem({ task, backlog, tasks, projects, activeSprint, sprintBusy, rollup, onReorder, onUpdate, onEdit }: Omit<Props, "loading" | "groups" | "epicRollups" | "onCapture"> & { task: Task; rollup?: { done: number; total: number } }) {
  return <div draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", String(task.id)); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
    event.preventDefault();
    const sourceTask = backlog.find((item) => item.id === Number(event.dataTransfer.getData("text/plain")));
    if (!sourceTask || sourceTask.project !== task.project || sourceTask.id === task.id) return;
    const siblings = backlog.filter((item) => item.project === task.project);
    const source = siblings.findIndex((item) => item.id === sourceTask.id); const target = siblings.findIndex((item) => item.id === task.id);
    const reordered = [...siblings]; const [item] = reordered.splice(source, 1); reordered.splice(target, 0, item);
    void Promise.all(reordered.map((entry, rank) => onUpdate(entry.id, { rank })));
  }} className="flex items-center gap-2">
    <div className="hidden flex-col items-center md:flex"><button type="button" aria-label="Move up" onClick={() => onReorder(task, -1)} className="rounded p-1 text-slate-300 hover:text-violet-600"><ArrowUp size={13} /></button><span className="text-[9px] text-slate-300">{String(task.rank + 1).padStart(2, "0")}</span><button type="button" aria-label="Move down" onClick={() => onReorder(task, 1)} className="rounded p-1 text-slate-300 hover:text-violet-600"><ArrowDown size={13} /></button></div>
    <div className="min-w-0 flex-1"><WorkItemCard task={task} candidates={tasks} members={projects.find((project) => project.id === task.project)?.members ?? []} onAssign={(userId) => void onUpdate(task.id, { assignee: userId })} onEscalate={() => void onUpdate(task.id, { escalated: true })} readiness={getDefinitionOfReady(task, tasks)} rollup={rollup} sprintAction="plan" sprintActionDisabled={!activeSprint || sprintBusy} onSprintAction={() => { if (activeSprint) void onUpdate(task.id, { status: "todo", sprint: activeSprint.id }); }} onEdit={() => onEdit(task.id)} /></div>
  </div>;
}

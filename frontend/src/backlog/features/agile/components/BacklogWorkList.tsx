import { GripVertical, Sparkles } from "lucide-react";
import type { Project } from "../../../../common/entities/project";
import type { Sprint, Task } from "../../../../common/entities/task";
import { useTranslation } from "../../../../common/shared/i18n/hooks/useTranslation";
import type { EpicRollup } from "../../../entities/backlog";
import { getDefinitionOfReady, groupBacklogTasks } from "../utils/backlog";
import { WorkItemCard } from "../../../../common/features/agile/components/WorkItemCard";

type Group = ReturnType<typeof groupBacklogTasks>[number];
interface BacklogWorkListProps {
  loading: boolean;
  backlog: Task[];
  tasks: Task[];
  projects: Project[];
  groups: Group[];
  activeSprint?: Sprint;
  sprintBusy: boolean;
  epicRollups: Map<number, EpicRollup>;
  onCapture: () => void;
  onReorder: (task: Task, direction: -1 | 1) => void;
  onUpdate: (taskId: number, changes: Partial<Task>) => Promise<unknown>;
  onEdit: (taskId: number) => void;
}

export function BacklogWorkList({ loading, backlog, tasks, projects, groups, activeSprint, sprintBusy, epicRollups, onCapture, onReorder, onUpdate, onEdit }: BacklogWorkListProps) {
  const { t } = useTranslation();
  if (loading) return <div className="p-12 text-center text-sm text-slate-500">{t("backlog.loading")}</div>;
  if (!backlog.length) return <div className="p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Sparkles size={21} /></div><h3 className="mt-3 font-semibold text-slate-900">{t("backlog.pipelineClear")}</h3><p className="mt-1 text-sm text-slate-500">{t("backlog.pipelineClearHint")}</p><button type="button" onClick={onCapture} className="mt-4 text-sm font-semibold text-violet-700 hover:text-violet-900">{t("backlog.captureNextIdea")}</button></div>;
  return <div className="space-y-6 p-4 md:p-5">{groups.map(([projectName, items, groupKey]) => <section key={groupKey} aria-label={t("backlog.groupAria", { name: projectName })}><div className="mb-3 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-500" /><h4 className="text-sm font-semibold text-slate-800">{projectName}</h4><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{items.length}</span></div><div className="space-y-2">{items.map((task) => <BacklogItem key={task.id} task={task} backlog={backlog} tasks={tasks} projects={projects} activeSprint={activeSprint} sprintBusy={sprintBusy} rollup={epicRollups.get(task.id)} onReorder={onReorder} onUpdate={onUpdate} onEdit={onEdit} />)}</div></section>)}</div>;
}

interface BacklogItemProps extends Omit<BacklogWorkListProps, "loading" | "groups" | "epicRollups" | "onCapture"> {
  task: Task;
  rollup?: EpicRollup;
}

function BacklogItem({ task, backlog, tasks, projects, activeSprint, sprintBusy, rollup, onUpdate, onEdit }: BacklogItemProps) {
  const { t } = useTranslation();
  return <div draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", String(task.id)); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
    event.preventDefault();
    const sourceTask = backlog.find((item) => item.id === Number(event.dataTransfer.getData("text/plain")));
    if (!sourceTask || sourceTask.project !== task.project || sourceTask.id === task.id) return;
    const siblings = backlog.filter((item) => item.project === task.project);
    const source = siblings.findIndex((item) => item.id === sourceTask.id); const target = siblings.findIndex((item) => item.id === task.id);
    const reordered = [...siblings]; const [item] = reordered.splice(source, 1); reordered.splice(target, 0, item);
    void Promise.all(reordered.map((entry, rank) => onUpdate(entry.id, { rank })));
  }} className="flex items-center gap-2">
    <GripVertical size={18} aria-label={t("backlog.dragToMove")} role="img" className="hidden shrink-0 cursor-grab text-slate-300 hover:text-violet-600 md:block" />
    <div className="min-w-0 flex-1"><WorkItemCard task={task} candidates={tasks} members={projects.find((project) => project.id === task.project)?.members ?? []} onAssign={(userId) => void onUpdate(task.id, { assignee: userId })} onEscalate={() => void onUpdate(task.id, { escalated: true })} readiness={getDefinitionOfReady(task, tasks)} rollup={rollup} sprintAction="plan" sprintActionDisabled={!activeSprint || sprintBusy} onSprintAction={() => { if (activeSprint) void onUpdate(task.id, { status: "todo", sprint: activeSprint.id }); }} onEdit={() => onEdit(task.id)} /></div>
  </div>;
}

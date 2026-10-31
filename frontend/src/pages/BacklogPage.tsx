import { useEffect, useMemo, useState } from "react";
import { Check, CircleHelp, Layers3, Plus, CalendarClock, Sparkles } from "lucide-react";
import { closeSprint, createSprint, getSprints, updateSprint } from "../api/tasks";
import type { Sprint, Task } from "../entities/task";
import { useAgileProjectScope } from "../features/agile/hooks/useAgileProjectScope";
import { useAgileTasks } from "../features/agile/hooks/useAgileTasks";
import { AgileProjectFilter } from "../features/agile/components/AgileProjectFilter";
import { QuickCaptureDialog } from "../features/agile/components/QuickCaptureDialog";
import { EditWorkItemDialog } from "../features/agile/components/EditWorkItemDialog";
import { BacklogMetric } from "../features/agile/components/BacklogMetric";
import { BacklogSprintPanel } from "../features/agile/components/BacklogSprintPanel";
import { BacklogWorkList } from "../features/agile/components/BacklogWorkList";
import { BacklogControls, type BacklogMode } from "../features/agile/components/BacklogControls";
import { getDefinitionOfReady, groupBacklogTasks, priorityOrder, suggestionReason, suggestedPriority, type BacklogGroupBy } from "../features/agile/utils/backlog";

export default function BacklogPage() {
  const scope = useAgileProjectScope("backlog_project_scope");
  const agile = useAgileTasks(scope.projectId);
  const { sync } = agile;
  const [asOf] = useState(() => Date.now());
  const [mode, setMode] = useState<BacklogMode>("groom");
  const [groupBy, setGroupBy] = useState<BacklogGroupBy>("project");
  const [search, setSearch] = useState("");
  const [captureOpen, setCaptureOpen] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [sprintCapacity, setSprintCapacity] = useState("");
  const [sprintBusy, setSprintBusy] = useState(false);
  const [sprintStartDate, setSprintStartDate] = useState("");
  const [sprintEndDate, setSprintEndDate] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(async () => {
      if (!scope.projectId) { if (active) setSprints([]); return; }
      try { const result = await getSprints(scope.projectId); if (active) setSprints(result); }
      catch { if (active) setSprints([]); }
    });
    return () => { active = false; };
  }, [scope.projectId]);
  useEffect(() => {
    const timer = window.setInterval(() => { void sync(); }, 20000);
    return () => window.clearInterval(timer);
  }, [sync]);

  const backlog = useMemo(() => agile.tasks.filter((task) => task.status === "backlog" &&
    `${task.title} ${task.description} ${task.tags.join(" ")}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => priorityOrder(a.priority) - priorityOrder(b.priority) || a.rank - b.rank || a.id - b.id), [agile.tasks, search]);
  const ready = backlog.filter((task) => task.ready_for_sprint && getDefinitionOfReady(task, agile.tasks).ready === getDefinitionOfReady(task, agile.tasks).total);
  const staleItems = backlog.filter((task) => asOf - Date.parse(task.updated_at ?? task.created_at ?? new Date(asOf).toISOString()) > 14 * 86400000);
  const missingEstimate = backlog.filter((task) => !task.estimate.trim());
  const blockedItems = backlog.filter((task) => task.blocked || task.blocked_by.some((id) => agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done")));
  const prioritySuggestions = backlog.map((task) => ({ task, priority: suggestedPriority(task, asOf), reason: suggestionReason(task, asOf) }))
    .filter(({ task, priority }) => task.priority !== priority).slice(0, 3);
  const epicRollups = useMemo(() => new Map(agile.tasks.filter((task) => task.work_type === "epic" || task.work_type === "initiative").map((epic) => {
    const children = agile.tasks.filter((task) => task.parent === epic.id);
    return [epic.id, { done: children.filter((task) => task.status === "done").length, total: children.length }] as const;
  })), [agile.tasks]);
  const grouped = useMemo(() => groupBacklogTasks(backlog, scope.projects, groupBy), [backlog, scope.projects, groupBy]);
  const activeSprint = sprints.find((sprint) => sprint.is_active);
  const editingTask = agile.tasks.find((task) => task.id === editingTaskId) ?? null;
  const editingProject = editingTask ? scope.projects.find((project) => project.id === editingTask.project) : undefined;

  async function startSprint() {
    if (!scope.projectId || !sprintName.trim()) return;
    setSprintBusy(true);
    try {
      const sprint = await createSprint(scope.projectId, sprintName.trim(), !activeSprint, sprintStartDate, sprintEndDate, sprintGoal.trim(), sprintCapacity ? Number(sprintCapacity) : null);
      setSprints((current) => [sprint, ...current.map((item) => sprint.is_active ? { ...item, is_active: false } : item)]);
      setSprintName("");
      setSprintGoal(""); setSprintCapacity("");
      setSprintStartDate(""); setSprintEndDate("");
      setMessage(sprint.is_active ? `${sprint.name} is now active.` : `${sprint.name} is planned. Add as many upcoming sprints as your roadmap needs.`);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to start sprint."); }
    finally { setSprintBusy(false); }
  }

  async function startPlannedSprint(sprint: Sprint) {
    setSprintBusy(true);
    try {
      const active = await updateSprint(sprint.id, { is_active: true });
      setSprints((current) => current.map((item) => ({ ...item, is_active: item.id === active.id })));
      setMessage(`${active.name} is now the active sprint.`);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to start this sprint."); }
    finally { setSprintBusy(false); }
  }

  async function finishSprint() {
    if (!activeSprint || !window.confirm(`Close ${activeSprint.name}? Unfinished work will move to the next planned sprint, or to the top of Backlog if none is planned.`)) return;
    setSprintBusy(true);
    try {
      const result = await closeSprint(activeSprint.id);
      setSprints(await getSprints(scope.projectId));
      await agile.sync();
      setMessage(result.message);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to close this sprint."); }
    finally { setSprintBusy(false); }
  }

  async function saveSprintChanges(sprintId: number, changes: Partial<Sprint>) {
    try {
      const updated = await updateSprint(sprintId, changes);
      setSprints((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to update sprint details."); }
  }

  async function planReadyItems() {
    if (!activeSprint) return;
    setSprintBusy(true);
    const planned = await Promise.all(ready.map((task) => agile.update(task.id, { sprint: activeSprint.id, status: "todo" })));
    setMessage(`${planned.filter(Boolean).length} ready item${planned.filter(Boolean).length === 1 ? "" : "s"} moved to ${activeSprint.name}.`);
    setSprintBusy(false);
  }

  async function reorder(task: Task, direction: -1 | 1) {
    const siblings = backlog.filter((item) => item.project === task.project);
    const index = siblings.findIndex((item) => item.id === task.id);
    const target = siblings[index + direction];
    if (!target) return;
    const next = [...siblings];
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    await Promise.all(next.map((item, rank) => agile.update(item.id, { rank })));
  }

  return <main className="min-h-screen bg-[#f7f7fb] p-5 md:p-8"><div className="mx-auto max-w-[1440px]">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-600">Plan what matters</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Backlog</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">A living pipeline for ideas. Shape the work, make value visible, and pull the clearest next step into execution.</p></div>
      <div className="flex flex-wrap items-end gap-3"><AgileProjectFilter projects={scope.projects} value={scope.projectId} onChange={scope.selectProject} /><button type="button" onClick={() => setCaptureOpen(true)} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"><Plus size={16} /> Capture idea</button></div>
    </header>

    <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Backlog health">
      <BacklogMetric label="Ideas in pipeline" value={agile.tasks.filter((task) => task.status === "backlog").length} detail="Across your project scope" icon={<Layers3 size={16} />} />
      <BacklogMetric label="Ready for sprint" value={agile.tasks.filter((task) => task.status === "backlog" && task.ready_for_sprint).length} detail="Clear enough to plan" icon={<Check size={16} />} tint="green" />
      <BacklogMetric label="Needs an estimate" value={missingEstimate.length} detail="Use estimation mode" icon={<CircleHelp size={16} />} tint="amber" />
      <BacklogMetric label="Blocked items" value={blockedItems.length} detail="Surface dependencies early" icon={<Sparkles size={16} />} tint="rose" />
      <BacklogMetric label="Stale over 14 days" value={staleItems.length} detail="Revisit or re-prioritize" icon={<CalendarClock size={16} />} tint="amber" />
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <BacklogControls mode={mode} setMode={setMode} groupBy={groupBy} setGroupBy={setGroupBy} search={search} setSearch={setSearch} suggestions={prioritySuggestions} onSetPriority={(task, priority) => void agile.update(task.id, { priority })} />
      {message && <p role="status" className="border-b border-slate-100 bg-emerald-50 px-5 py-2.5 text-sm text-emerald-800">{message}</p>}
      {agile.error && <p role="alert" className="border-b border-slate-100 bg-rose-50 px-5 py-2.5 text-sm text-rose-700">{agile.error}</p>}

      <BacklogSprintPanel projectId={scope.projectId} projectRole={scope.project?.my_role} sprints={sprints} activeSprint={activeSprint} readyCount={ready.length} backlogPoints={backlog.reduce((sum, task) => sum + (Number.parseFloat(task.estimate) || 0), 0)} busy={sprintBusy} name={sprintName} setName={setSprintName} goal={sprintGoal} setGoal={setSprintGoal} capacity={sprintCapacity} setCapacity={setSprintCapacity} startDate={sprintStartDate} setStartDate={setSprintStartDate} endDate={sprintEndDate} setEndDate={setSprintEndDate} onCreate={() => void startSprint()} onPlanReady={() => void planReadyItems()} onStartPlanned={(sprint) => void startPlannedSprint(sprint)} onClose={() => void finishSprint()} onUpdate={(id, changes) => void saveSprintChanges(id, changes)} />


      <BacklogWorkList loading={agile.loading} backlog={backlog} tasks={agile.tasks} projects={scope.projects} groups={grouped} activeSprint={activeSprint} sprintBusy={sprintBusy} epicRollups={epicRollups} onCapture={() => setCaptureOpen(true)} onReorder={(task, direction) => void reorder(task, direction)} onUpdate={agile.update} onEdit={setEditingTaskId} />
    </section>
    {captureOpen && <QuickCaptureDialog projects={scope.projects} defaultProjectId={scope.projectId} onClose={() => setCaptureOpen(false)} onCreated={(task) => agile.setTasks((current) => [...current, task])} />}
    {editingTask && editingProject && <EditWorkItemDialog task={editingTask} project={editingProject} candidates={agile.tasks} onClose={() => setEditingTaskId(null)} onSave={(changes) => agile.update(editingTask.id, changes)} />}
  </div></main>;
}

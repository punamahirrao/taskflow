import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Check, CircleHelp, Layers3, Plus, Search, Sparkles, CalendarClock } from "lucide-react";
import { closeSprint, createSprint, getSprints, updateSprint } from "../api/tasks";
import type { Sprint, Task } from "../entities/task";
import { useAgileProjectScope } from "../features/agile/hooks/useAgileProjectScope";
import { useAgileTasks } from "../features/agile/hooks/useAgileTasks";
import { AgileProjectFilter } from "../features/agile/components/AgileProjectFilter";
import { QuickCaptureDialog } from "../features/agile/components/QuickCaptureDialog";
import { WorkItemCard } from "../features/agile/components/WorkItemCard";
import { EditWorkItemDialog } from "../features/agile/components/EditWorkItemDialog";

type Mode = "groom" | "estimate";
type GroupBy = "project" | "theme" | "parent";

export default function BacklogPage() {
  const scope = useAgileProjectScope("backlog_project_scope");
  const agile = useAgileTasks(scope.projectId);
  const { sync } = agile;
  const [asOf] = useState(() => Date.now());
  const [mode, setMode] = useState<Mode>("groom");
  const [groupBy, setGroupBy] = useState<GroupBy>("project");
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
  const grouped = useMemo(() => groupTasks(backlog, scope.projects, groupBy), [backlog, scope.projects, groupBy]);
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
      <Metric label="Ideas in pipeline" value={agile.tasks.filter((task) => task.status === "backlog").length} detail="Across your project scope" icon={<Layers3 size={16} />} />
      <Metric label="Ready for sprint" value={agile.tasks.filter((task) => task.status === "backlog" && task.ready_for_sprint).length} detail="Clear enough to plan" icon={<Check size={16} />} tint="green" />
      <Metric label="Needs an estimate" value={missingEstimate.length} detail="Use estimation mode" icon={<CircleHelp size={16} />} tint="amber" />
      <Metric label="Blocked items" value={blockedItems.length} detail="Surface dependencies early" icon={<Sparkles size={16} />} tint="rose" />
      <Metric label="Stale over 14 days" value={staleItems.length} detail="Revisit or re-prioritize" icon={<CalendarClock size={16} />} tint="amber" />
    </section>

    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 md:px-5">
        <div><h3 className="font-semibold text-slate-900">Prioritized work</h3><p className="mt-0.5 text-xs text-slate-500">Drag items to rank them, then groom for clarity and readiness.</p></div>
        <div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-xs text-slate-500">Group<select aria-label="Group backlog by" value={groupBy} onChange={(event) => setGroupBy(event.target.value as GroupBy)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700"><option value="project">Project</option><option value="theme">Theme tag</option><option value="parent">Epic / initiative</option></select></label><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label="Search backlog" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Find work" className="w-44 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" /></div>
          <div className="flex rounded-lg bg-slate-100 p-1"><button type="button" onClick={() => setMode("groom")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === "groom" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}>Refine</button><button type="button" onClick={() => setMode("estimate")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === "estimate" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}>Estimate</button></div>
        </div>
      </div>
      {mode === "groom" && <div className="border-b border-emerald-100 bg-emerald-50/70 px-5 py-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-emerald-900">Refinement: Definition of Ready</p><p className="text-[11px] text-emerald-800">A clear outcome, estimate, owner, and no unresolved blockers before sprint planning.</p></div><div className="mt-2 flex flex-wrap gap-3 text-[10px] text-emerald-800">{["Description", "Estimate", "Assignee", "Dependencies clear"].map((label) => <span key={label} className="inline-flex items-center gap-1"><Check size={12} />{label}</span>)}</div></div>}
      {mode === "estimate" && <div className="flex gap-2 border-b border-violet-100 bg-violet-50 px-5 py-3 text-xs text-violet-800"><CircleHelp size={15} className="shrink-0" /><p>Estimation mode: add story points or a t-shirt size on each item. Keep estimates relative to the team’s own work.</p></div>}
      {prioritySuggestions.length > 0 && <div className="border-b border-amber-100 bg-amber-50/70 px-5 py-3"><div className="mb-2 flex items-center gap-2"><Sparkles size={14} className="text-amber-600" /><p className="text-xs font-semibold text-amber-900">Priority suggestions</p><span className="text-[10px] text-amber-700">Based on urgency, due dates, age, and readiness</span></div><div className="flex flex-wrap gap-2">{prioritySuggestions.map(({ task, priority, reason }) => <button key={task.id} type="button" onClick={() => void agile.update(task.id, { priority })} title={reason} className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:border-amber-400"><span className="font-semibold">{task.title}</span><span className="ml-2 text-amber-700">→ {priority}</span></button>)}</div><p className="mt-1 text-[9px] text-amber-700">These are transparent rule-based hints; no AI provider is connected.</p></div>}
      {message && <p role="status" className="border-b border-slate-100 bg-emerald-50 px-5 py-2.5 text-sm text-emerald-800">{message}</p>}
      {agile.error && <p role="alert" className="border-b border-slate-100 bg-rose-50 px-5 py-2.5 text-sm text-rose-700">{agile.error}</p>}

      {scope.projectId && <section className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <CalendarClock size={16} className="text-violet-600" />
          {activeSprint ? <><span className="text-xs text-slate-500">Current sprint</span><span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">{activeSprint.name}</span><button type="button" disabled={!ready.length || sprintBusy} onClick={() => void planReadyItems()} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-40">Plan {ready.length} ready</button><button type="button" disabled={sprintBusy || !["owner", "admin"].includes(scope.project?.my_role ?? "")} onClick={() => void finishSprint()} className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:text-rose-700 disabled:opacity-40">Close sprint</button></> : <span className="text-xs text-slate-500">No current sprint. Start one or create future sprints for your roadmap.</span>}
        </div>
        <form onSubmit={(event) => { event.preventDefault(); void startSprint(); }} className="mt-3 flex flex-wrap items-center gap-2">
          <input value={sprintName} onChange={(event) => setSprintName(event.target.value)} placeholder={activeSprint ? "Upcoming sprint name" : "Sprint name"} aria-label="Sprint name" className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm" />
          <input value={sprintGoal} onChange={(event) => setSprintGoal(event.target.value)} placeholder="Sprint goal" aria-label="Sprint goal" className="min-w-48 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm" />
          <label className="text-[10px] text-slate-400">Capacity<input type="number" min="1" value={sprintCapacity} onChange={(event) => setSprintCapacity(event.target.value)} placeholder="Points" aria-label="Sprint capacity points" className="ml-1 w-20 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600" /></label>
          <label className="text-[10px] text-slate-400">Start<input type="date" value={sprintStartDate} onChange={(event) => setSprintStartDate(event.target.value)} className="ml-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600" /></label>
          <label className="text-[10px] text-slate-400">End<input type="date" value={sprintEndDate} onChange={(event) => setSprintEndDate(event.target.value)} className="ml-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600" /></label>
          <button disabled={sprintBusy || !sprintName.trim()} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Plus size={13} />{activeSprint ? "Plan upcoming sprint" : "Start sprint"}</button>
        </form>
        {activeSprint && <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Sprint goal<input key={`${activeSprint.id}-${activeSprint.goal}`} defaultValue={activeSprint.goal} onBlur={(event) => { if (event.target.value !== activeSprint.goal) void saveSprintChanges(activeSprint.id, { goal: event.target.value }); }} placeholder="What outcome will this sprint deliver?" className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700" /></label>
          <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Capacity · points<input key={`${activeSprint.id}-${activeSprint.capacity_points}`} type="number" min="1" defaultValue={activeSprint.capacity_points ?? ""} onBlur={(event) => { const value = event.target.value ? Number(event.target.value) : null; if (value !== activeSprint.capacity_points) void saveSprintChanges(activeSprint.id, { capacity_points: value }); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700" /></label>
        </div>}
        {sprints.some((sprint) => !sprint.is_active && !sprint.is_closed) && <div className="mt-3 flex flex-wrap items-center gap-2">{sprints.filter((sprint) => !sprint.is_active && !sprint.is_closed).map((sprint) => <div key={sprint.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="text-xs font-medium text-slate-700">{sprint.name}</span>{sprint.start_date && <span className="text-[10px] text-slate-400">{sprint.start_date}{sprint.end_date ? ` – ${sprint.end_date}` : ""}</span>}<button type="button" disabled={!!activeSprint || sprintBusy || !["owner", "admin"].includes(scope.project?.my_role ?? "")} onClick={() => void startPlannedSprint(sprint)} className="text-[10px] font-semibold text-violet-700 disabled:text-slate-300">Start</button></div>)}</div>}
        {activeSprint && (() => { const closed = sprints.filter((sprint) => sprint.is_closed && sprint.velocity_points !== null).slice(0, 3); const velocity = closed.length ? closed.reduce((sum, sprint) => sum + (sprint.velocity_points ?? 0), 0) / closed.length : 0; const points = backlog.reduce((sum, task) => sum + (Number.parseFloat(task.estimate) || 0), 0); return <p className="mt-2 text-[11px] text-slate-500">{velocity ? `Forecast: ${points} estimated backlog points at ${velocity.toFixed(1)} average velocity ≈ ${Math.ceil(points / velocity)} sprint${Math.ceil(points / velocity) === 1 ? "" : "s"}.` : "Sprint forecast appears after a few sprints have recorded velocity."}</p>; })()}
        {sprints.some((sprint) => sprint.is_closed) && <div className="mt-4 space-y-2">{sprints.filter((sprint) => sprint.is_closed).slice(0, 2).map((sprint) => <details key={sprint.id} className="rounded-lg border border-slate-200 bg-white p-3"><summary className="cursor-pointer text-xs font-semibold text-slate-700">Sprint review · {sprint.name} · {sprint.velocity_points ?? 0} points</summary><p className="mt-2 text-xs text-slate-600">{sprint.outcome_summary || "No outcome summary."}</p><label className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Retrospective<textarea key={`${sprint.id}-${sprint.retrospective}`} defaultValue={sprint.retrospective} rows={2} placeholder="What should the team keep, change, or try next?" onBlur={(event) => { if (event.target.value !== sprint.retrospective) void saveSprintChanges(sprint.id, { retrospective: event.target.value }); }} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-normal normal-case tracking-normal text-slate-700" /></label></details>)}</div>}
      </section>}
      {!scope.projectId && <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">Select a project to create a sprint and plan its ready work. Multi-project ideas stay grouped below without duplicates.</div>}

      {agile.loading ? <div className="p-12 text-center text-sm text-slate-500">Loading backlog…</div> : backlog.length === 0 ? <div className="p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-50 text-violet-600"><Sparkles size={21} /></div><h3 className="mt-3 font-semibold text-slate-900">Your pipeline is clear</h3><p className="mt-1 text-sm text-slate-500">Capture an idea or move work back here for another round of thinking.</p><button type="button" onClick={() => setCaptureOpen(true)} className="mt-4 text-sm font-semibold text-violet-700 hover:text-violet-900">Capture the next idea</button></div> : <div className="space-y-6 p-4 md:p-5">
        {grouped.map(([projectName, items, groupKey]) => <section key={groupKey} aria-label={`${projectName} backlog`}><div className="mb-3 flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-500" /><h4 className="text-sm font-semibold text-slate-800">{projectName}</h4><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">{items.length}</span></div><div className="space-y-2">{items.map((task) => <div key={task.id} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", String(task.id)); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const sourceTask = backlog.find((item) => item.id === Number(event.dataTransfer.getData("text/plain"))); if (!sourceTask || sourceTask.project !== task.project || sourceTask.id === task.id) return; const siblings = backlog.filter((item) => item.project === task.project); const source = siblings.findIndex((item) => item.id === sourceTask.id); const target = siblings.findIndex((item) => item.id === task.id); const reordered = [...siblings]; const [item] = reordered.splice(source, 1); reordered.splice(target, 0, item); void Promise.all(reordered.map((entry, rank) => agile.update(entry.id, { rank }))); }} className="flex items-center gap-2"><div className="hidden flex-col items-center md:flex"><button type="button" aria-label="Move up" onClick={() => void reorder(task, -1)} className="rounded p-1 text-slate-300 hover:text-violet-600"><ArrowUp size={13} /></button><span className="text-[9px] text-slate-300">{String(task.rank + 1).padStart(2, "0")}</span><button type="button" aria-label="Move down" onClick={() => void reorder(task, 1)} className="rounded p-1 text-slate-300 hover:text-violet-600"><ArrowDown size={13} /></button></div><div className="min-w-0 flex-1"><WorkItemCard task={task} candidates={agile.tasks} members={scope.projects.find((project) => project.id === task.project)?.members ?? []} onAssign={(userId) => void agile.update(task.id, { assignee: userId })} onEscalate={() => void agile.update(task.id, { escalated: true })} readiness={getDefinitionOfReady(task, agile.tasks)} rollup={epicRollups.get(task.id)} sprintAction="plan" sprintActionDisabled={!activeSprint || sprintBusy} onSprintAction={() => { if (activeSprint) void agile.update(task.id, { status: "todo", sprint: activeSprint.id }); }} onEdit={() => setEditingTaskId(task.id)} /></div></div>)}</div></section>)}
      </div>}
    </section>
    {captureOpen && <QuickCaptureDialog projects={scope.projects} defaultProjectId={scope.projectId} onClose={() => setCaptureOpen(false)} onCreated={(task) => agile.setTasks((current) => [...current, task])} />}
    {editingTask && editingProject && <EditWorkItemDialog task={editingTask} project={editingProject} candidates={agile.tasks} onClose={() => setEditingTaskId(null)} onSave={(changes) => agile.update(editingTask.id, changes)} />}
  </div></main>;
}

function Metric({ label, value, detail, icon, tint = "violet" }: { label: string; value: number; detail: string; icon: ReactNode; tint?: string }) {
  const colors: Record<string, string> = { violet: "bg-violet-50 text-violet-700", green: "bg-emerald-50 text-emerald-700", amber: "bg-amber-50 text-amber-700", rose: "bg-rose-50 text-rose-700" };
  return <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[tint]}`}>{icon}</span></div><p className="mt-2 text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-[11px] text-slate-400">{detail}</p></div>;
}

function priorityOrder(priority: Task["priority"]) { return ({ urgent: 0, high: 1, medium: 2, low: 3 })[priority]; }
function getDefinitionOfReady(task: Task, tasks: Task[]) {
  const hasUnresolvedDependency = task.blocked || task.blocked_by.some((id) => tasks.some((dependency) => dependency.id === id && dependency.status !== "done"));
  const checks = [Boolean(task.description.trim()), Boolean(task.estimate.trim()), task.assignee !== null, !hasUnresolvedDependency];
  return { ready: checks.filter(Boolean).length, total: checks.length, checks };
}

function suggestedPriority(task: Task, now: number): Task["priority"] {
  let score = ({ urgent: 4, high: 3, medium: 2, low: 1 })[task.priority];
  if (task.due_date) {
    const daysUntilDue = (Date.parse(`${task.due_date}T00:00:00`) - now) / 86400000;
    if (daysUntilDue < 0) score += 2;
    else if (daysUntilDue <= 3) score += 1;
  }
  const updatedAt = Date.parse(task.updated_at ?? task.created_at ?? "");
  if (Number.isFinite(updatedAt) && now - updatedAt > 14 * 86400000) score += 1;
  if (task.ready_for_sprint) score += 0.5;
  return score >= 5 ? "urgent" : score >= 4 ? "high" : score >= 2 ? "medium" : "low";
}

function suggestionReason(task: Task, now: number) {
  const reasons: string[] = [];
  if (task.due_date && Date.parse(`${task.due_date}T00:00:00`) < now) reasons.push("overdue");
  else if (task.due_date && Date.parse(`${task.due_date}T00:00:00`) - now < 4 * 86400000) reasons.push("due soon");
  const updatedAt = Date.parse(task.updated_at ?? task.created_at ?? "");
  if (Number.isFinite(updatedAt) && now - updatedAt > 14 * 86400000) reasons.push("stale for 14+ days");
  if (task.ready_for_sprint) reasons.push("marked ready");
  return reasons.length ? reasons.join(", ") : "current priority and readiness signals";
}

function groupTasks(tasks: Task[], projects: { id: number; name: string }[], groupBy: GroupBy) {
  const groups = new Map<string, { name: string; tasks: Task[] }>();
  tasks.forEach((task) => {
    const name = groupBy === "project"
      ? task.project_name ?? projects.find((project) => project.id === task.project)?.name ?? `Project ${task.project}`
      : groupBy === "theme" ? task.tags[0] ?? "Untagged theme" : task.parent_title ?? "Independent work";
    const key = groupBy === "project" ? `project-${task.project}` : `${groupBy}-${name}`;
    const group = groups.get(key) ?? { name, tasks: [] };
    group.tasks.push(task);
    groups.set(key, group);
  });
  return [...groups.entries()].sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([key, group]) => [group.name, group.tasks, key] as const);
}

import { useEffect, useMemo, useState } from "react";
import { Activity, AlertTriangle, ArrowDownRight, CheckCheck, CirclePlus, Clock3, Gauge, Plus, RefreshCw, Zap } from "lucide-react";
import { addBoardColumn, getBoardColumns, getSprints, updateBoardColumn } from "../api/tasks";
import type { BoardColumn, Sprint, Task } from "../entities/task";
import { AgileProjectFilter } from "../features/agile/components/AgileProjectFilter";
import { WorkItemCard } from "../features/agile/components/WorkItemCard";
import { useAgileProjectScope } from "../features/agile/hooks/useAgileProjectScope";
import { useAgileTasks } from "../features/agile/hooks/useAgileTasks";
import { EditWorkItemDialog } from "../features/agile/components/EditWorkItemDialog";
import { SprintInsightsPanel } from "../features/agile/components/SprintInsightsPanel";
import { BoardMetric } from "../features/agile/components/BoardMetric";
import { STAGE_ORDER, averageDays, type Swimlane } from "../features/agile/utils/boardView";
import { BoardColumnLane } from "../features/agile/components/BoardColumnLane";

export default function BoardsPage() {
  const scope = useAgileProjectScope("boards_project_scope");
  const [now] = useState(() => Date.now());
  const [sprintMode, setSprintMode] = useState(false);
  const [swimlane, setSwimlane] = useState<Swimlane>("project");
  const agile = useAgileTasks(scope.projectId, sprintMode);
  const { sync } = agile;
  const [columnsByProject, setColumnsByProject] = useState<Record<number, BoardColumn[]>>({});
  const [columnBusy, setColumnBusy] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnLimit, setNewColumnLimit] = useState("");
  const [addingColumn, setAddingColumn] = useState(false);
  const [message, setMessage] = useState("");
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => { void sync(); }, 20000);
    return () => window.clearInterval(timer);
  }, [sync]);

  const visibleProjects = useMemo(() => scope.projectId ? scope.projects.filter((project) => project.id === scope.projectId) : scope.projects, [scope.projectId, scope.projects]);
  useEffect(() => {
    let active = true;
    Promise.all(visibleProjects.map(async (project) => [project.id, await getBoardColumns(project.id)] as const))
      .then((entries) => { if (active) setColumnsByProject(Object.fromEntries(entries)); })
      .catch((cause: unknown) => { if (active) setMessage(cause instanceof Error ? cause.message : "Unable to load board workflow."); });
    return () => { active = false; };
  }, [visibleProjects]);
  useEffect(() => {
    let active = true;
    void getSprints().then((result) => { if (active) setSprints(result); }).catch(() => { if (active) setSprints([]); });
    const timer = window.setInterval(() => { void getSprints().then((result) => { if (active) setSprints(result); }).catch(() => undefined); }, 20000);
    return () => { active = false; window.clearInterval(timer); };
  }, []);

  const columns = useMemo(() => {
    const found = new Map<string, BoardColumn>();
    Object.values(columnsByProject).flat().forEach((column) => { if (!found.has(column.key)) found.set(column.key, column); });
    return [...found.values()].sort((a, b) => {
      const ai = STAGE_ORDER.indexOf(a.key); const bi = STAGE_ORDER.indexOf(b.key);
      if (ai >= 0 || bi >= 0) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      return a.position - b.position || a.name.localeCompare(b.name);
    });
  }, [columnsByProject]);
  const boardTasks = agile.tasks.filter((task) => columns.some((column) => column.key === task.status));
  const blockedCount = boardTasks.filter((task) => task.blocked || (task.blocked_by ?? []).some((id) => agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done"))).length;
  const doing = boardTasks.filter((task) => task.status === "in_progress").length;
  const completedRecently = boardTasks.filter((task) => task.completed_at && now - Date.parse(task.completed_at) < 7 * 86400000).length;
  const cycleDays = averageDays(boardTasks.filter((task) => task.started_at && task.completed_at).map((task) => Date.parse(task.completed_at!) - Date.parse(task.started_at!)));
  const leadDays = averageDays(boardTasks.filter((task) => task.completed_at && task.created_at).map((task) => Date.parse(task.completed_at!) - Date.parse(task.created_at!)));
  const canCustomize = Boolean(scope.project && ["owner", "admin"].includes(scope.project.my_role ?? ""));
  const activeSprints = useMemo(() => new Map(sprints.filter((sprint) => sprint.is_active).map((sprint) => [sprint.project, sprint])), [sprints]);
  const editingTask = agile.tasks.find((task) => task.id === editingTaskId) ?? null;
  const editingProject = editingTask ? scope.projects.find((project) => project.id === editingTask.project) : undefined;

  async function moveToColumn(taskId: number, status: string) {
    const task = agile.tasks.find((item) => item.id === taskId);
    if (!task) return;
    if (status === "backlog") { await agile.update(taskId, { status, sprint: null }); return; }
    const sprint = activeSprints.get(task.project);
    await agile.update(taskId, { status, ...(task.status === "backlog" && sprint ? { sprint: sprint.id } : {}) });
  }

  async function addColumn() {
    if (!scope.projectId || !newColumnName.trim()) return;
    setAddingColumn(true);
    try {
      const column = await addBoardColumn(scope.projectId, newColumnName.trim(), newColumnLimit ? Number(newColumnLimit) : null);
      setColumnsByProject((current) => ({ ...current, [scope.projectId!]: [...(current[scope.projectId!] ?? []), column] }));
      setNewColumnName(""); setNewColumnLimit(""); setMessage(`${column.name} added to the project workflow.`);
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to add this workflow stage."); }
    finally { setAddingColumn(false); }
  }

  async function saveWipLimit(column: BoardColumn, value: string) {
    if (!scope.projectId || value === String(column.wip_limit ?? "")) return;
    setColumnBusy(true);
    try {
      const updated = await updateBoardColumn(scope.projectId, column.id, { wip_limit: value ? Number(value) : null });
      setColumnsByProject((current) => ({ ...current, [scope.projectId!]: (current[scope.projectId!] ?? []).map((item) => item.id === updated.id ? updated : item) }));
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : "Unable to update WIP limit."); }
    finally { setColumnBusy(false); }
  }

  function renderBoardTask(task: Task) {
    const activeSprint = activeSprints.get(task.project);
    const sprintAction = task.sprint && task.status !== "done" ? "backlog" : task.status === "backlog" ? (activeSprint ? "plan" : undefined) : activeSprint ? "add" : undefined;
    return <div key={task.id} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", String(task.id)); event.dataTransfer.effectAllowed = "move"; }} className="cursor-grab active:cursor-grabbing"><WorkItemCard task={task} candidates={agile.tasks} members={scope.projects.find((item) => item.id === task.project)?.members ?? []} onAssign={(userId) => void agile.update(task.id, { assignee: userId })} onEscalate={() => void agile.update(task.id, { escalated: true })} sprintAction={sprintAction} sprintActionDisabled={sprintAction !== "backlog" && !activeSprint} onSprintAction={() => { if (task.sprint) void agile.update(task.id, { status: "backlog", sprint: null }); else if (activeSprint) void agile.update(task.id, task.status === "backlog" ? { status: "todo", sprint: activeSprint.id } : { sprint: activeSprint.id }); }} onEdit={() => setEditingTaskId(task.id)} /></div>;
  }

  return <main className="min-h-screen bg-[#f7f7fb] p-5 md:p-8"><div className="mx-auto max-w-[1600px]">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-600">Make value flow</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Boards</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">See work move through the system. Keep flow visible, surface blockers early, and make the next handoff clear.</p></div><div className="flex flex-wrap items-end gap-3"><AgileProjectFilter projects={scope.projects} value={scope.projectId} onChange={scope.selectProject} /><label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Swimlanes<select aria-label="Board swimlanes" value={swimlane} onChange={(event) => setSwimlane(event.target.value as Swimlane)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-700"><option value="project">Project</option><option value="priority">Priority</option><option value="assignee">Assignee</option><option value="epic">Epic / initiative</option><option value="sprint_goal">Sprint goal</option></select></label><button type="button" onClick={() => setSprintMode((value) => !value)} aria-pressed={sprintMode} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${sprintMode ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}><Zap size={15} />{sprintMode ? "Sprint mode on" : "Sprint mode"}</button><button type="button" onClick={() => void agile.reload()} aria-label="Refresh board" className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 hover:text-violet-700"><RefreshCw size={16} /></button></div></header>

    <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Flow metrics">
      <BoardMetric label="Throughput · 7 days" value={completedRecently} note="Items completed" icon={<CheckCheck size={16} />} />
      <BoardMetric label="Cycle time" value={cycleDays === null ? "—" : `${cycleDays}d`} note="Start to done · average" icon={<Clock3 size={16} />} />
      <BoardMetric label="Lead time" value={leadDays === null ? "—" : `${leadDays}d`} note="Created to done · average" icon={<Activity size={16} />} />
      <BoardMetric label="In progress" value={doing} note="Current work in motion" icon={<Gauge size={16} />} tint="blue" />
      <BoardMetric label="Blockers" value={blockedCount} note={blockedCount ? "Needs a team unblock" : "No blocked work"} icon={<AlertTriangle size={16} />} tint={blockedCount ? "rose" : "green"} />
    </section>

    {blockedCount > 0 && <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertTriangle size={16} />{blockedCount} {blockedCount === 1 ? "item is" : "items are"} blocked. Surface the dependency in stand-up and clear the path.</div>}
    <SprintInsightsPanel tasks={boardTasks} sprints={sprints} />
    {sprintMode && <div className="mb-4 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800"><Zap size={15} />Sprint mode shows tasks assigned to an active sprint across this board scope.</div>}
    {message && <p role="status" className="mb-4 rounded-lg bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">{message}</p>}
    {agile.error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{agile.error}</p>}

    {canCustomize && <form onSubmit={(event) => { event.preventDefault(); void addColumn(); }} className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-3"><CirclePlus size={17} className="text-violet-600" /><span className="mr-2 text-xs font-semibold text-slate-600">Tune this workflow</span><input value={newColumnName} onChange={(event) => setNewColumnName(event.target.value)} placeholder="New stage name" className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-violet-200" /><input type="number" min="1" value={newColumnLimit} onChange={(event) => setNewColumnLimit(event.target.value)} placeholder="WIP limit" aria-label="New stage WIP limit" className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-violet-200" /><button disabled={addingColumn || !newColumnName.trim()} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Plus size={13} />Add stage</button><span className="text-[11px] text-slate-400">Owners and managers can customize columns for the selected project.</span></form>}
    {!scope.projectId && <p className="mb-4 rounded-xl bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">Multi-project flow is grouped by project inside each stage. Choose one project to customize workflow and WIP limits.</p>}

    {agile.loading || !columns.length ? <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center text-sm text-slate-500">{agile.loading ? "Loading flow…" : "Setting up project workflow…"}</div> : <div className="flex gap-3 overflow-x-auto pb-4">{columns.map((column) => {
      const inColumn = boardTasks.filter((task) => task.status === column.key);
      const overLimit = visibleProjects.some((project) => {
        const projectColumn = (columnsByProject[project.id] ?? []).find((item) => item.key === column.key);
        const count = inColumn.filter((task) => task.project === project.id).length;
        return projectColumn?.wip_limit !== null && projectColumn?.wip_limit !== undefined && count > projectColumn.wip_limit;
      });
      const singleProjectColumn = scope.projectId ? (columnsByProject[scope.projectId] ?? []).find((item) => item.key === column.key) : null;
      const aggregateLimit = visibleProjects.reduce((total, project) => total + ((columnsByProject[project.id] ?? []).find((item) => item.key === column.key)?.wip_limit ?? 0), 0);
      return <BoardColumnLane key={column.key} column={column} tasks={inColumn} swimlane={swimlane} projects={scope.projects} singleProject={singleProjectColumn} projectSelected={Boolean(scope.projectId)} canCustomize={canCustomize} busy={columnBusy} overLimit={overLimit} aggregateLimit={aggregateLimit} onSaveLimit={(item, value) => void saveWipLimit(item, value)} onMove={(taskId, status) => void moveToColumn(taskId, status)} renderTask={renderBoardTask} />;
    })}</div>}
    {!agile.loading && !boardTasks.length && <div className="mt-2 flex items-center gap-2 text-xs text-slate-400"><ArrowDownRight size={14} />Move an item from Backlog to start execution.</div>}
    {editingTask && editingProject && <EditWorkItemDialog task={editingTask} project={editingProject} candidates={agile.tasks} onClose={() => setEditingTaskId(null)} onSave={(changes) => agile.update(editingTask.id, changes)} />}
  </div></main>;
}

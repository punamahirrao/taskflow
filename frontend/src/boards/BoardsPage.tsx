import "./boards.css";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowDownRight, CirclePlus, Plus, RefreshCw, Zap } from "lucide-react";
import { addBoardColumn, getBoardColumns, getSprints, updateBoardColumn } from "../common/api/tasks";
import type { BoardColumn, Sprint, Task } from "../common/entities/task";
import { AgileProjectFilter } from "../common/features/agile/components/AgileProjectFilter";
import { WorkItemCard } from "../common/features/agile/components/WorkItemCard";
import { useAgileProjectScope } from "../common/features/agile/hooks/useAgileProjectScope";
import { useAgileTasks } from "../common/features/agile/hooks/useAgileTasks";
import { EditWorkItemDialog } from "../common/features/agile/components/EditWorkItemDialog";
import { STAGE_ORDER, type Swimlane } from "../common/features/agile/utils/boardView";
import { BoardColumnLane } from "./features/agile/components/BoardColumnLane";
import type { TranslationKey } from "../common/entities/language";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { translate } from "../common/shared/i18n/translate";
import type { BoardColumnGroup } from "./entities/boards";

const SWIMLANES: [Swimlane, TranslationKey][] = [["project", "boards.laneProject"], ["priority", "boards.lanePriority"], ["assignee", "boards.laneAssignee"], ["epic", "boards.laneEpic"], ["sprint_goal", "boards.laneSprintGoal"]];

export default function BoardsPage() {
  const { t } = useTranslation();
  const scope = useAgileProjectScope("boards_project_scope");
  const [sprintMode, setSprintMode] = useState(true);
  const [swimlane, setSwimlane] = useState<Swimlane>("project");
  const agile = useAgileTasks(scope.projectId);
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
      .catch((cause: unknown) => { if (active) setMessage(cause instanceof Error ? cause.message : translate("boards.errLoadWorkflow")); });
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
      if (a.status_order !== b.status_order) return a.status_order - b.status_order;
      const ai = STAGE_ORDER.indexOf(a.key); const bi = STAGE_ORDER.indexOf(b.key);
      if (ai >= 0 || bi >= 0) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
      return a.position - b.position || a.name.localeCompare(b.name);
    });
  }, [columnsByProject]);
  const activeSprints = useMemo(() => new Map(sprints.filter((sprint) => sprint.is_active).map((sprint) => [sprint.project, sprint])), [sprints]);
  const activeSprintsForFilter = useMemo(() => new Set(sprints.filter((sprint) => sprint.is_active).map((sprint) => sprint.id)), [sprints]);
  const boardTasks = agile.tasks.filter((task) => columns.some((column) => column.key === task.status) && (!sprintMode || task.status === "backlog" || Boolean(task.sprint && activeSprintsForFilter.has(task.sprint))));
  const blockedCount = boardTasks.filter((task) => task.blocked || (task.blocked_by ?? []).some((id) => agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done"))).length;
  const canCustomize = Boolean(scope.project && ["owner", "admin"].includes(scope.project.my_role ?? ""));
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
      const column = await addBoardColumn(scope.projectId, newColumnName.trim(), newColumnLimit ? Number(newColumnLimit) : null, "Other");
      setColumnsByProject((current) => ({ ...current, [scope.projectId!]: [...(current[scope.projectId!] ?? []), column] }));
      setNewColumnName(""); setNewColumnLimit(""); setMessage(t("boards.stageAdded", { name: column.name }));
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : t("boards.errAddStage")); }
    finally { setAddingColumn(false); }
  }

  async function saveWipLimit(column: BoardColumn, value: string) {
    if (!scope.projectId || value === String(column.wip_limit ?? "")) return;
    setColumnBusy(true);
    try {
      const updated = await updateBoardColumn(scope.projectId, column.id, { wip_limit: value ? Number(value) : null });
      setColumnsByProject((current) => ({ ...current, [scope.projectId!]: (current[scope.projectId!] ?? []).map((item) => item.id === updated.id ? updated : item) }));
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : t("boards.errUpdateWip")); }
    finally { setColumnBusy(false); }
  }

  async function saveGroupName(groupColumns: BoardColumn[], value: string) {
    if (!scope.projectId) return;
    setColumnBusy(true);
    try {
      const updates = await Promise.all(groupColumns.map((column) => updateBoardColumn(scope.projectId!, column.id, { group_name: value.trim() })));
      setColumnsByProject((current) => ({ ...current, [scope.projectId!]: (current[scope.projectId!] ?? []).map((item) => updates.find((updated) => updated.id === item.id) ?? item) }));
    } catch (cause) { setMessage(cause instanceof Error ? cause.message : t("boards.errUpdateGroup")); }
    finally { setColumnBusy(false); }
  }

  const columnGroups = useMemo(() => {
    const groups: BoardColumnGroup[] = [];
    for (const column of columns) {
      const name = column.group_name || "Other";
      const last = groups.at(-1);
      if (last?.name === name) last.columns.push(column);
      else groups.push({ name, columns: [column] });
    }
    return groups;
  }, [columns]);

  function renderBoardTask(task: Task) {
    const activeSprint = activeSprints.get(task.project);
    const sprintAction = task.sprint && task.status !== "done" ? "backlog" : task.status === "backlog" ? (activeSprint ? "plan" : undefined) : activeSprint ? "add" : undefined;
    return <div key={task.id} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", String(task.id)); event.dataTransfer.effectAllowed = "move"; }} className="cursor-grab active:cursor-grabbing"><WorkItemCard task={task} candidates={agile.tasks} members={scope.projects.find((item) => item.id === task.project)?.members ?? []} onAssign={(userId) => void agile.update(task.id, { assignee: userId })} onEscalate={() => void agile.update(task.id, { escalated: true })} sprintAction={sprintAction} sprintActionDisabled={sprintAction !== "backlog" && !activeSprint} onSprintAction={() => { if (task.sprint) void agile.update(task.id, { status: "backlog", sprint: null }); else if (activeSprint) void agile.update(task.id, task.status === "backlog" ? { status: "todo", sprint: activeSprint.id } : { sprint: activeSprint.id }); }} onEdit={() => setEditingTaskId(task.id)} /></div>;
  }

  return <main className="min-h-screen bg-[#f7f7fb] p-5 md:p-8"><div className="mx-auto max-w-[1600px]">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-sky-600">{t("boards.eyebrow")}</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">{t("boards.title")}</h2><p className="mt-2 max-w-2xl text-sm text-slate-500">{t("boards.subtitle")}</p></div><div className="flex flex-wrap items-end gap-3"><AgileProjectFilter projects={scope.projects} value={scope.projectId} onChange={scope.selectProject} /><label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{t("boards.swimlanes")}<select aria-label={t("boards.swimlanesAria")} value={swimlane} onChange={(event) => setSwimlane(event.target.value as Swimlane)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-700">{SWIMLANES.map(([value, labelKey]) => <option key={value} value={value}>{t(labelKey)}</option>)}</select></label><button type="button" onClick={() => setSprintMode((value) => !value)} aria-pressed={sprintMode} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${sprintMode ? "bg-violet-600 text-white" : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}><Zap size={15} />{sprintMode ? t("boards.activeSprintAndBacklog") : t("boards.allWork")}</button><button type="button" onClick={() => void agile.reload()} aria-label={t("boards.refreshAria")} className="rounded-lg border border-slate-200 bg-white p-2.5 text-slate-500 hover:text-violet-700"><RefreshCw size={16} /></button></div></header>

    {blockedCount > 0 && <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"><AlertTriangle size={16} />{t(blockedCount === 1 ? "boards.blockedOne" : "boards.blockedMany", { count: blockedCount })}</div>}
    {sprintMode && <div className="mb-4 flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-sm text-violet-800"><Zap size={15} />{t("boards.sprintModeNotice")}</div>}
    {message && <p role="status" className="mb-4 rounded-lg bg-white px-4 py-2.5 text-sm text-slate-600 shadow-sm">{message}</p>}
    {agile.error && <p role="alert" className="mb-4 rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-700">{agile.error}</p>}

    {canCustomize && <form onSubmit={(event) => { event.preventDefault(); void addColumn(); }} className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-3"><CirclePlus size={17} className="text-violet-600" /><span className="mr-2 text-xs font-semibold text-slate-600">{t("boards.tuneWorkflow")}</span><input value={newColumnName} onChange={(event) => setNewColumnName(event.target.value)} placeholder={t("boards.newStageName")} className="rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-violet-200" /><input type="number" min="1" value={newColumnLimit} onChange={(event) => setNewColumnLimit(event.target.value)} placeholder={t("boards.wipLimit")} aria-label={t("boards.newStageWipLimitAria")} className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-violet-200" /><button disabled={addingColumn || !newColumnName.trim()} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Plus size={13} />{t("boards.addStage")}</button><span className="text-[11px] text-slate-400">{t("boards.customizeHint")}</span></form>}
    {!scope.projectId && <p className="mb-4 rounded-xl bg-white px-4 py-3 text-xs text-slate-500 shadow-sm">{t("boards.multiProjectHint")}</p>}

    {agile.loading || !columns.length ? <div className="rounded-2xl border border-slate-200 bg-white p-14 text-center text-sm text-slate-500">{agile.loading ? t("boards.loadingFlow") : t("boards.settingUpWorkflow")}</div> : <div className="flex gap-4 overflow-x-auto pb-4">{columnGroups.map((group) => <section key={group.name} className="shrink-0 rounded-2xl border border-slate-300 bg-slate-50/80 p-2 shadow-sm"><header className="flex items-center justify-between gap-3 px-2 pb-2 pt-1"><div><p className="text-[9px] font-bold uppercase tracking-[.18em] text-slate-400">{t("boards.statusGroup")}</p>{canCustomize ? <input aria-label={t("boards.groupNameAria", { name: group.name })} defaultValue={group.name} onBlur={(event) => { if (event.target.value.trim() !== group.name) void saveGroupName(group.columns, event.target.value); }} disabled={columnBusy} className="w-36 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs font-bold text-slate-700 hover:border-slate-300 focus:border-indigo-300 focus:outline-none" /> : <h3 className="px-1 py-0.5 text-xs font-bold text-slate-700">{group.name}</h3>}</div><span className="rounded-full bg-white px-2 py-1 text-[9px] font-semibold text-slate-500">{t(group.columns.length === 1 ? "boards.statusCountOne" : "boards.statusCountMany", { count: group.columns.length })}</span></header><div className="flex gap-2">{group.columns.map((column) => {
      const inColumn = boardTasks.filter((task) => task.status === column.key);
      const overLimit = visibleProjects.some((project) => {
        const projectColumn = (columnsByProject[project.id] ?? []).find((item) => item.key === column.key);
        const count = inColumn.filter((task) => task.project === project.id).length;
        return projectColumn?.wip_limit !== null && projectColumn?.wip_limit !== undefined && count > projectColumn.wip_limit;
      });
      const singleProjectColumn = scope.projectId ? (columnsByProject[scope.projectId] ?? []).find((item) => item.key === column.key) : null;
      const aggregateLimit = visibleProjects.reduce((total, project) => total + ((columnsByProject[project.id] ?? []).find((item) => item.key === column.key)?.wip_limit ?? 0), 0);
      return <BoardColumnLane key={column.key} column={column} tasks={inColumn} swimlane={swimlane} projects={scope.projects} singleProject={singleProjectColumn} projectSelected={Boolean(scope.projectId)} canCustomize={canCustomize} busy={columnBusy} overLimit={overLimit} aggregateLimit={aggregateLimit} onSaveLimit={(item, value) => void saveWipLimit(item, value)} onMove={(taskId, status) => void moveToColumn(taskId, status)} renderTask={renderBoardTask} />;
    })}</div></section>)}</div>}
    {!agile.loading && !boardTasks.length && <div className="mt-2 flex items-center gap-2 text-xs text-slate-400"><ArrowDownRight size={14} />{t("boards.moveItemHint")}</div>}
    {editingTask && editingProject && <EditWorkItemDialog task={editingTask} project={editingProject} candidates={agile.tasks} onClose={() => setEditingTaskId(null)} onSave={(changes) => agile.update(editingTask.id, changes)} />}
  </div></main>;
}

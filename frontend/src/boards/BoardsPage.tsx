import "./boards.css";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RefreshCw, Settings2, Zap } from "lucide-react";
import { getAgileBoards, getAgileBoardColumns, getBoardColumns, getSprints } from "../project-detail/api/tasks";
import type { AgileBoard, BoardColumn, Sprint, Task } from "../common/entities/task";
import { WorkItemCard } from "../common/features/agile/components/WorkItemCard";
import { useAgileProjectScope } from "../common/features/agile/hooks/useAgileProjectScope";
import { useAgileTasks } from "../common/features/agile/hooks/useAgileTasks";
import { EditWorkItemDialog } from "../common/features/agile/components/EditWorkItemDialog";
import type { Swimlane } from "../common/features/agile/utils/boardView";
import type { TranslationKey } from "../common/entities/language";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import type { BoardColumnGroup } from "./entities/boards";
import { WorkflowConfigDialog } from "../project-detail/components/WorkflowConfigDialog";
import { BoardWorkHeader, BoardWorkPageShell } from "./BoardsPage.styles";
import { BoardPageSelectField } from "./components/BoardPageSelectField";
import { BoardWorkflowFeature } from "./features/BoardWorkflowFeature";

const SWIMLANES: [Swimlane, TranslationKey][] = [["project", "boards.laneProject"], ["priority", "boards.lanePriority"], ["assignee", "boards.laneAssignee"], ["epic", "boards.laneEpic"], ["sprint_goal", "boards.laneSprintGoal"]];

export default function BoardsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [searchParams] = useSearchParams();
  const boardProjectId = Number(searchParams.get("project")) || null;
  const scope = useAgileProjectScope("boards_project_scope");
  const [sprintMode, setSprintMode] = useState(true);
  const [swimlane, setSwimlane] = useState<Swimlane>("project");
  const agile = useAgileTasks(boardProjectId, false, Number(boardId) || null);
  const { sync } = agile;
  const [columnsByProject, setColumnsByProject] = useState<Record<number, BoardColumn[]>>({});
  const [message, setMessage] = useState("");
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [boardsByProject, setBoardsByProject] = useState<Record<number, AgileBoard[]>>({});
  const [configureWorkflow, setConfigureWorkflow] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => { void sync(); }, 20000);
    return () => window.clearInterval(timer);
  }, [sync]);

  const visibleProjects = useMemo(() => boardProjectId ? scope.projects.filter((project) => project.id === boardProjectId) : [], [boardProjectId, scope.projects]);
  const visibleProjectKey = visibleProjects.map((project) => project.id).join(",");
  useEffect(() => {
    let active = true;
    Promise.all(visibleProjects.map(async (project) => [project.id, Number(boardId) ? await getAgileBoardColumns(project.id, Number(boardId)) : await getBoardColumns(project.id)] as const))
      .then((entries) => { if (active) setColumnsByProject(Object.fromEntries(entries)); })
      .catch((cause: unknown) => { if (active) setMessage(cause instanceof Error ? cause.message : t("boards.errLoadWorkflow")); });
    return () => { active = false; };
  }, [visibleProjectKey, visibleProjects, t, boardId]);
  useEffect(() => {
    let active = true;
    Promise.all(visibleProjects.map(async (project) => [project.id, await getAgileBoards(project.id)] as const))
      .then((entries) => { if (active) setBoardsByProject(Object.fromEntries(entries)); })
      .catch(() => { if (active) setBoardsByProject({}); });
    return () => { active = false; };
  }, [visibleProjectKey, visibleProjects]);
  useEffect(() => {
    let active = true;
    void getSprints(boardProjectId, Number(boardId) || null).then((result) => { if (active) setSprints(result); }).catch(() => { if (active) setSprints([]); });
    const timer = window.setInterval(() => { void getSprints(boardProjectId, Number(boardId) || null).then((result) => { if (active) setSprints(result); }).catch(() => undefined); }, 20000);
    return () => { active = false; window.clearInterval(timer); };
  }, [boardProjectId, boardId]);

  const columns = useMemo(() => {
    const found = new Map<string, BoardColumn>();
    Object.values(columnsByProject).flat().forEach((column) => { if (!found.has(String(column.id))) found.set(String(column.id), column); });
    return [...found.values()].sort((a, b) => a.position - b.position || a.status_order - b.status_order || a.name.localeCompare(b.name));
  }, [columnsByProject]);
  const projectBoards = boardProjectId ? boardsByProject[boardProjectId] ?? [] : [];
  const selectedBoard = projectBoards.find((board) => board.id === Number(boardId)) ?? null;
  const usesSprints = selectedBoard?.board_type !== "kanban";
  const activeSprints = useMemo(() => new Map(sprints.filter((sprint) => sprint.is_active).map((sprint) => [sprint.project, sprint])), [sprints]);
  const activeSprintsForFilter = useMemo(() => new Set(sprints.filter((sprint) => sprint.is_active).map((sprint) => sprint.id)), [sprints]);
  const boardTasks = agile.tasks.filter((task) => (!usesSprints || !sprintMode || task.status === "backlog" || Boolean(task.sprint && activeSprintsForFilter.has(task.sprint))));
  const blockedCount = boardTasks.filter((task) => task.blocked || (task.blocked_by ?? []).some((id) => agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done"))).length;
  const editingTask = agile.tasks.find((task) => task.id === editingTaskId) ?? null;
  const editingProject = editingTask ? scope.projects.find((project) => project.id === editingTask.project) : undefined;

  async function moveToColumn(taskId: number, status: string) {
    const task = agile.tasks.find((item) => item.id === taskId);
    if (!task) return;
    if (status === "backlog") { await agile.update(taskId, { status, sprint: null }); return; }
    const sprint = activeSprints.get(task.project);
    await agile.update(taskId, { status, ...(task.status === "backlog" && sprint ? { sprint: sprint.id } : {}) });
  }

  const columnGroups = useMemo<BoardColumnGroup[]>(() => columns.map((column) => ({ name: column.name, columns: [column] })), [columns]);

  function renderBoardTask(task: Task) {
    const activeSprint = activeSprints.get(task.project);
    const sprintAction = task.sprint && task.status !== "done" ? "backlog" : task.status === "backlog" ? (activeSprint ? "plan" : undefined) : activeSprint ? "add" : undefined;
    return <div key={task.id} draggable onDragStart={(event) => { event.dataTransfer.setData("text/plain", String(task.id)); event.dataTransfer.effectAllowed = "move"; }} className="cursor-grab active:cursor-grabbing"><WorkItemCard task={task} candidates={agile.tasks} members={scope.projects.find((item) => item.id === task.project)?.members ?? []} onAssign={(userId) => void agile.update(task.id, { assignee: userId })} onEscalate={() => void agile.update(task.id, { escalated: true })} sprintAction={sprintAction} sprintActionDisabled={sprintAction !== "backlog" && !activeSprint} onSprintAction={() => { if (task.sprint) void agile.update(task.id, { status: "backlog", sprint: null }); else if (activeSprint) void agile.update(task.id, task.status === "backlog" ? { status: "todo", sprint: activeSprint.id } : { sprint: activeSprint.id }); }} onEdit={() => setEditingTaskId(task.id)} /></div>;
  }

  return <BoardWorkPageShell><div className="mx-auto max-w-[1600px]">
    <BoardWorkHeader><div><p className="text-xs font-bold uppercase tracking-[.2em] text-info">{t("boards.eyebrow")}</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-content">{selectedBoard?.name ?? t("boards.title")}</h2><p className="mt-2 max-w-2xl text-sm text-muted">{selectedBoard?.description || t("boards.subtitle")}</p></div><div className="flex flex-wrap items-end gap-3"><button type="button" onClick={() => navigate("/boards")} className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content">{t("boards.backToBoards")}</button>{projectBoards.length > 1 && <BoardPageSelectField id="choose-board" testId="choose-board" label={t("boards.chooseBoard")} value={String(selectedBoard?.id ?? "")} onChange={(value) => { const next = projectBoards.find((item) => item.id === Number(value)); if (next) navigate(`/boards/${next.id}?project=${next.project}`); }}>{projectBoards.map((board) => <option key={board.id} value={board.id}>{board.name}</option>)}</BoardPageSelectField>}{selectedBoard?.can_manage && <button type="button" onClick={() => setConfigureWorkflow(true)} className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 text-sm font-semibold text-content"><Settings2 size={15}/>{t("boards.configureBoard")}</button>}<BoardPageSelectField id="swimlanes" testId="swimlanes" label={t("boards.swimlanes")} value={swimlane} onChange={(value) => setSwimlane(value as Swimlane)}>{SWIMLANES.map(([value, labelKey]) => <option key={value} value={value}>{t(labelKey)}</option>)}</BoardPageSelectField>{usesSprints && <button type="button" onClick={() => setSprintMode((value) => !value)} aria-pressed={sprintMode} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold ${sprintMode ? "bg-accent text-white" : "border border-line bg-surface text-content hover:bg-subtle"}`}><Zap size={15} />{sprintMode ? t("boards.activeSprintAndBacklog") : t("boards.allWork")}</button>}<button type="button" onClick={() => void agile.reload()} aria-label={t("boards.refreshAria")} className="rounded-lg border border-line bg-surface p-2.5 text-muted hover:text-accent"><RefreshCw size={16} /></button></div></BoardWorkHeader>

    <BoardWorkflowFeature message={message} error={agile.error} blockedCount={blockedCount} sprintNotice={usesSprints && sprintMode} loading={agile.loading} columns={columnGroups} tasks={boardTasks} projectColumns={columnsByProject} visibleProjects={visibleProjects} projects={scope.projects} projectSelected={Boolean(boardProjectId)} swimlane={swimlane} onMove={(taskId, status) => void moveToColumn(taskId, status)} renderTask={renderBoardTask}/>
    {editingTask && editingProject && <EditWorkItemDialog task={editingTask} project={editingProject} candidates={agile.tasks} onClose={() => setEditingTaskId(null)} onSave={(changes) => agile.update(editingTask.id, changes)} />}
    {configureWorkflow && boardProjectId && selectedBoard && <WorkflowConfigDialog projectId={boardProjectId} boardId={selectedBoard.id} onClose={() => setConfigureWorkflow(false)} onSaved={() => { void getAgileBoardColumns(boardProjectId, selectedBoard.id).then((result) => setColumnsByProject((current) => ({ ...current, [boardProjectId]: result }))); }} />}
  </div></BoardWorkPageShell>;
}

import { useEffect, useState } from "react";
import { getBoardColumns } from "../../common/api/tasks";
import type { Project } from "../../common/entities/project";
import type { TranslationKey } from "../../common/entities/language";
import type { BoardColumn } from "../../common/entities/task";
import type { Task, TaskStatus } from "../../common/entities/task";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import AddTaskDialog from "../features/tasks/components/AddTaskDialog";
import TaskCard from "../features/tasks/components/TaskCard";

const DEFAULT_COLUMNS: BoardColumn[] = [
  { id: 0, key: "backlog", name: "Backlog", position: 0, status_order: 0, group_name: "Planning", wip_limit: null },
  { id: 1, key: "todo", name: "Todo", position: 1, status_order: 1, group_name: "Active work", wip_limit: null },
  { id: 2, key: "in_progress", name: "In Progress", position: 2, status_order: 2, group_name: "Active work", wip_limit: null },
  { id: 3, key: "review", name: "Review", position: 3, status_order: 3, group_name: "Quality", wip_limit: null },
  { id: 4, key: "waiting", name: "Waiting", position: 4, status_order: 4, group_name: "Waiting", wip_limit: null },
  { id: 5, key: "done", name: "Done", position: 5, status_order: 5, group_name: "Complete", wip_limit: null },
];
const COLUMN_STYLE: Record<string, string> = { backlog: "bg-slate-100", todo: "bg-purple-100", in_progress: "bg-sky-100", review: "bg-amber-100", waiting: "bg-orange-100", done: "bg-emerald-100" };

const DEFAULT_COLUMN_NAMES: Record<string, TranslationKey> = {
  backlog: "projectDetail.board.columnBacklog", todo: "projectDetail.board.columnTodo", in_progress: "projectDetail.board.columnInProgress",
  review: "projectDetail.board.columnReview", waiting: "projectDetail.board.columnWaiting", done: "projectDetail.board.columnDone",
};

interface TaskBoardProps {
  project: Project;
  tasks: Task[];
  error: string;
  onAdd: (task: Task) => void;
  onMove: (id: number, status: TaskStatus) => void;
}

export function TaskBoard({ project, tasks, error, onAdd, onMove }: TaskBoardProps) {
  const { t } = useTranslation();
  const [showAddTask, setShowAddTask] = useState(false);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>(DEFAULT_COLUMNS);
  useEffect(() => {
    let active = true;
    getBoardColumns(project.id).then((result) => { if (active) setColumns(result); }).catch(() => { if (active) setColumns(DEFAULT_COLUMNS); });
    return () => { active = false; };
  }, [project.id]);
  return <section className="mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="mb-5 flex items-center"><h2 className="text-2xl font-semibold text-gray-900">{t("projectDetail.board.tasks")}</h2><span className="ml-2 text-sm text-red-500">{tasks.length}</span><button type="button" onClick={() => setShowAddTask((open) => !open)} className="ml-auto rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600">{showAddTask ? t("projectDetail.board.close") : t("projectDetail.board.add")}</button></div>
    {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
    {showAddTask && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" aria-label={t("projectDetail.board.closeAddTaskDialog")} onClick={() => setShowAddTask(false)} className="absolute inset-0 cursor-default bg-black/50" /><div className="relative z-10 w-full max-w-lg"><AddTaskDialog project={project} onClose={() => setShowAddTask(false)} onTaskAdded={onAdd} /></div></div>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-5">{columns.map((column) => <div key={column.key} onDragOver={(event) => { event.preventDefault(); setDragOver(column.key); }} onDragLeave={() => setDragOver(null)} onDrop={(event) => { event.preventDefault(); setDragOver(null); onMove(Number(event.dataTransfer.getData("text/plain")), column.key); }} className={`rounded-lg border bg-gray-50 transition ${dragOver === column.key ? "border-cyan-400 ring-2 ring-cyan-300" : "border-gray-200"}`}>
      <h3 className={`mb-2 rounded-t-lg text-center text-lg font-semibold text-gray-600 ${COLUMN_STYLE[column.key] ?? "bg-violet-100"}`}>{columns === DEFAULT_COLUMNS && DEFAULT_COLUMN_NAMES[column.key] ? t(DEFAULT_COLUMN_NAMES[column.key]) : column.name}</h3><div className="flex min-h-24 flex-col gap-2 p-2">{tasks.filter((task) => task.status === column.key).map((task) => <TaskCard key={task.id} task={task} />)}</div>
    </div>)}</div>
  </section>;
}

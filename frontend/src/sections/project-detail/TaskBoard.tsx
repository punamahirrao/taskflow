import { useEffect, useState } from "react";
import { getBoardColumns } from "../../api/tasks";
import type { Project } from "../../entities/project";
import type { BoardColumn } from "../../entities/task";
import type { Task, TaskStatus } from "../../entities/task";
import AddTaskDialog from "../../features/tasks/components/AddTaskDialog";
import TaskCard from "../../features/tasks/components/TaskCard";

const DEFAULT_COLUMNS: { key: TaskStatus; name: string; position: number; id: number; wip_limit: number | null }[] = [
  { id: 0, key: "backlog", name: "Backlog", position: 0, wip_limit: null },
  { id: 1, key: "todo", name: "Todo", position: 1, wip_limit: null },
  { id: 2, key: "in_progress", name: "In Progress", position: 2, wip_limit: null },
  { id: 3, key: "review", name: "Review", position: 3, wip_limit: null },
  { id: 4, key: "done", name: "Done", position: 4, wip_limit: null },
];
const COLUMN_STYLE: Record<string, string> = { backlog: "bg-slate-100", todo: "bg-purple-100", in_progress: "bg-sky-100", review: "bg-amber-100", done: "bg-emerald-100" };

export function TaskBoard({ project, tasks, error, onAdd, onMove }: {
  project: Project; tasks: Task[]; error: string;
  onAdd: (task: Task) => void; onMove: (id: number, status: TaskStatus) => void;
}) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  const [columns, setColumns] = useState<BoardColumn[]>(DEFAULT_COLUMNS);
  useEffect(() => {
    let active = true;
    getBoardColumns(project.id).then((result) => { if (active) setColumns(result); }).catch(() => { if (active) setColumns(DEFAULT_COLUMNS); });
    return () => { active = false; };
  }, [project.id]);
  return <section className="mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="mb-5 flex items-center"><h2 className="text-2xl font-semibold text-gray-900">Tasks</h2><span className="ml-2 text-sm text-red-500">{tasks.length}</span><button type="button" onClick={() => setShowAddTask((open) => !open)} className="ml-auto rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600">{showAddTask ? "Close" : "+ Add"}</button></div>
    {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
    {showAddTask && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" aria-label="Close add task dialog" onClick={() => setShowAddTask(false)} className="absolute inset-0 cursor-default bg-black/50" /><div className="relative z-10 w-full max-w-lg"><AddTaskDialog project={project} onClose={() => setShowAddTask(false)} onTaskAdded={onAdd} /></div></div>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-5">{columns.map((column) => <div key={column.key} onDragOver={(event) => { event.preventDefault(); setDragOver(column.key); }} onDragLeave={() => setDragOver(null)} onDrop={(event) => { event.preventDefault(); setDragOver(null); onMove(Number(event.dataTransfer.getData("text/plain")), column.key); }} className={`rounded-lg border bg-gray-50 transition ${dragOver === column.key ? "border-cyan-400 ring-2 ring-cyan-300" : "border-gray-200"}`}>
      <h3 className={`mb-2 rounded-t-lg text-center text-lg font-semibold text-gray-600 ${COLUMN_STYLE[column.key] ?? "bg-violet-100"}`}>{column.name}</h3><div className="flex min-h-24 flex-col gap-2 p-2">{tasks.filter((task) => task.status === column.key).map((task) => <TaskCard key={task.id} task={task} />)}</div>
    </div>)}</div>
  </section>;
}

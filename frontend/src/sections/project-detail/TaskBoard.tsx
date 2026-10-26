import { useState } from "react";
import type { Project } from "../../entities/project";
import type { Task, TaskStatus } from "../../entities/task";
import AddTaskDialog from "../../features/tasks/components/AddTaskDialog";
import TaskCard from "../../features/tasks/components/TaskCard";

const columns: { status: TaskStatus; title: string; headerClass: string }[] = [
  { status: "todo", title: "Todo", headerClass: "bg-purple-100" },
  { status: "in_progress", title: "In Progress", headerClass: "bg-green-100" },
  { status: "done", title: "Done", headerClass: "bg-orange-100" },
];

export function TaskBoard({ project, tasks, error, onAdd, onMove }: {
  project: Project; tasks: Task[]; error: string;
  onAdd: (task: Task) => void; onMove: (id: number, status: TaskStatus) => void;
}) {
  const [showAddTask, setShowAddTask] = useState(false);
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null);
  return <section className="mt-2 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="mb-5 flex items-center"><h2 className="text-2xl font-semibold text-gray-900">Tasks</h2><span className="ml-2 text-sm text-red-500">{tasks.length}</span><button type="button" onClick={() => setShowAddTask((open) => !open)} className="ml-auto rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600">{showAddTask ? "Close" : "+ Add"}</button></div>
    {error && <p role="alert" className="mb-4 text-red-600">{error}</p>}
    {showAddTask && <div className="fixed inset-0 z-50 flex items-center justify-center p-4"><button type="button" aria-label="Close add task dialog" onClick={() => setShowAddTask(false)} className="absolute inset-0 cursor-default bg-black/50" /><div className="relative z-10 w-full max-w-lg"><AddTaskDialog project={project} onClose={() => setShowAddTask(false)} onTaskAdded={onAdd} /></div></div>}
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">{columns.map((column) => <div key={column.status} onDragOver={(event) => { event.preventDefault(); setDragOver(column.status); }} onDragLeave={() => setDragOver(null)} onDrop={(event) => { event.preventDefault(); setDragOver(null); onMove(Number(event.dataTransfer.getData("text/plain")), column.status); }} className={`rounded-lg border bg-gray-50 transition ${dragOver === column.status ? "border-cyan-400 ring-2 ring-cyan-300" : "border-gray-200"}`}>
      <h3 className={`mb-2 rounded-t-lg text-center text-lg font-semibold text-gray-600 ${column.headerClass}`}>{column.title}</h3><div className="flex min-h-24 flex-col gap-2 p-2">{tasks.filter((task) => task.status === column.status).map((task) => <TaskCard key={task.id} task={task} />)}</div>
    </div>)}</div>
  </section>;
}

import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProject } from "../features/projects/hooks/useProject";
import { useProjectTasks } from "../features/tasks/hooks/useProjectTasks";
import type { Task } from "../entities/task";
import { ProjectHeader } from "../sections/project-detail/ProjectHeader";
import { ProjectOverview } from "../sections/project-detail/ProjectOverview";
import { ProjectTabs, type ProjectTab } from "../sections/project-detail/ProjectTabs";
import { TaskBoard } from "../sections/project-detail/TaskBoard";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, loading, error: projectError } = useProject(id);
  const { tasks, setTasks, loading: tasksLoading, error, moveTask } = useProjectTasks(id);
  const [tab, setTab] = useState<ProjectTab>("overview");

  if (loading || tasksLoading) return <div role="status" className="flex min-h-screen items-center justify-center bg-gray-100">Loading project...</div>;
  if (!project) return <main className="min-h-screen bg-gray-100 p-6"><p role="alert" className="text-red-600">{projectError || "Project not found."}</p><button type="button" onClick={() => navigate("/dashboard")} className="mt-4 text-cyan-700 hover:underline">Back to Dashboard</button></main>;

  const completed = tasks.filter((task) => task.status === "done").length;
  const addTask = (task: Task) => setTasks((current) => [...current, task]);

  return <main className="min-w-0"><div className="min-h-screen bg-gray-100 p-2"><div className="mx-auto max-w-8xl">
    <ProjectHeader project={project} completed={completed} total={tasks.length} />
    <ProjectTabs active={tab} onChange={setTab} />
    {tab === "overview" && <ProjectOverview project={project} tasks={tasks} />}
    {(tab === "timeline" || tab === "files") && <div className="mt-2 rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">Coming soon.</div>}
    {tab === "tasks" && <TaskBoard project={project} tasks={tasks} error={error} onAdd={addTask} onMove={(taskId, status) => void moveTask(taskId, status)} />}
  </div></div></main>;
}

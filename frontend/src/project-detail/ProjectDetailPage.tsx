import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProject } from "./features/projects/hooks/useProject";
import { useProjectTasks } from "./features/tasks/hooks/useProjectTasks";
import type { Task } from "../features/tasks/entities/task";
import { ProjectHeader } from "./sections/ProjectHeader";
import { ProjectOverview } from "./sections/ProjectOverview";
import type { ProjectTab } from "./entities/projectDetail";
import { ProjectTabs } from "./sections/ProjectTabs";
import { TaskBoard } from "./sections/TaskBoard";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { EditProjectDialog } from "./components/EditProjectDialog";
import DocumentsPage from "../documents/DocumentsPage";
import { ProjectTimelineCalendar } from "./sections/ProjectTimelineCalendar";

export default function ProjectDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { project, setProject, loading, error: projectError } = useProject(id);
  const { reload } = useProjectContext();
  const { tasks, setTasks, loading: tasksLoading, error, moveTask } = useProjectTasks(id);
  const [tab, setTab] = useState<ProjectTab>("overview");
  const [editingProject, setEditingProject] = useState(false);

  if (loading || tasksLoading)
    return (
      <div role="status" className="flex min-h-screen items-center justify-center bg-gray-100">
        {t("projectDetail.loading")}
      </div>
    );
  if (!project)
    return (
      <main className="min-h-screen bg-gray-100 p-6">
        <p role="alert" className="text-red-600">
          {projectError || t("projectDetail.notFound")}
        </p>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="mt-4 text-cyan-700 hover:underline"
        >
          {t("projectDetail.backToDashboard")}
        </button>
      </main>
    );

  const completed = tasks.filter((task) => task.status === "done").length;
  const addTask = (task: Task) => setTasks((current) => [...current, task]);

  return (
    <main className="min-w-0">
      <div className="min-h-screen bg-gray-100 p-2">
        <ProjectHeader
          project={project}
          completed={completed}
          total={tasks.length}
          onEdit={() => setEditingProject(true)}
        />
        {editingProject && (
          <EditProjectDialog
            project={project}
            onClose={() => setEditingProject(false)}
            onUpdated={(updated) => {
              setProject(updated);
              setEditingProject(false);
              void reload();
            }}
          />
        )}
        <ProjectTabs active={tab} onChange={setTab} />
        {tab === "overview" && <ProjectOverview project={project} tasks={tasks} />}
        {tab === "timeline" && <ProjectTimelineCalendar project={project} tasks={tasks} />}
        {tab === "files" && (
          <div className="mt-2">
            <DocumentsPage key={project.id} projectId={project.id} />
          </div>
        )}
        {tab === "tasks" && (
          <TaskBoard
            project={project}
            tasks={tasks}
            error={error}
            onAdd={addTask}
            onMove={(taskId, status) => void moveTask(taskId, status)}
          />
        )}
      </div>
    </main>
  );
}

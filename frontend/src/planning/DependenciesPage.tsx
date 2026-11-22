import { PaddedPage } from "../common/components/styled";
import { useState } from "react";
import { GitBranch, Plus, Unlink } from "lucide-react";
import { Link } from "react-router-dom";
import { useAgileTasks } from "../features/tasks/hooks/useAgileTasks";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { DependencyForm } from "./components/DependencyForm";
import { useSaveDependenciesMutation } from "./api/dependenciesQuery";
import { useToast } from "../common/features/notifications/useToast";
import type { Task } from "../features/tasks/entities/task";

export default function DependenciesPage() {
  const { projects, selectedId, error: projectsError } = useProjectContext();
  const { tasks, loading, error } = useAgileTasks(null);
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState("");
  const [save, { isLoading: saving }] = useSaveDependenciesMutation();
  const toast = useToast();
  const editableProjects = projects.filter(
    (project) =>
      ["owner", "admin", "member"].includes(project.my_role ?? "") &&
      (!selectedId || project.id === selectedId),
  );
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const items = tasks.filter(
    (task) =>
      (!selectedId || task.project === selectedId) &&
      (task.blocked_by.length || task.related_tasks?.length),
  );
  async function removeDependency(task: Task, prerequisiteId: number) {
    setActionError("");
    try {
      await save({
        taskId: task.id,
        blockedBy: task.blocked_by.filter((id) => id !== prerequisiteId),
      }).unwrap();
      toast("success", "Dependency removed.");
    } catch (cause) {
      setActionError(
        cause && typeof cause === "object" && "message" in cause
          ? String(cause.message)
          : "Could not remove this dependency.",
      );
    }
  }
  return (
    <PaddedPage>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold">
            <GitBranch className="text-accent" />
            Dependencies & linked work
          </h1>
          <p className="mt-2 text-sm text-muted">
            Connect work items to the prerequisites they depend on.
          </p>
        </div>
        {editableProjects.length > 0 && (
          <button
            type="button"
            disabled={loading || Boolean(error)}
            onClick={() => setCreating(true)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            <Plus size={16} /> Create dependency
          </button>
        )}
      </header>
      {loading && <p role="status">Loading work items…</p>}
      {(error || projectsError || actionError) && (
        <p role="alert" className="mb-4 text-sm text-danger">
          {error || projectsError || actionError}
        </p>
      )}
      <div className="space-y-3">
        {items.map((task) => (
          <article key={task.id} className="rounded-xl border border-line bg-surface p-4">
            <Link className="font-semibold text-accent" to={`/project/${task.project}`}>
              NEX-{task.id} · {task.title}
            </Link>
            <p className="mt-2 text-xs text-muted">{task.project_name}</p>
            {task.blocked_by.map((id) => (
              <div
                key={`dep-${id}`}
                className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-subtle px-3 py-2 text-sm"
              >
                <div>
                  <span className="mr-2 text-muted">Depends on</span>
                  <span className="font-medium">
                    {byId.has(id) ? `NEX-${id} · ${byId.get(id)!.title}` : "Restricted work item"}
                  </span>
                  <span className="ml-2 text-xs text-muted">
                    {byId.get(id)?.status.replaceAll("_", " ")}
                  </span>
                </div>
                {editableProjects.some((project) => project.id === task.project) && (
                  <button
                    type="button"
                    disabled={saving}
                    aria-label={`Remove dependency from NEX-${task.id} to NEX-${id}`}
                    title="Remove dependency"
                    onClick={() => void removeDependency(task, id)}
                    className="shrink-0 rounded-md p-2 text-muted hover:bg-surface hover:text-danger disabled:opacity-50"
                  >
                    <Unlink size={16} />
                  </button>
                )}
              </div>
            ))}
            {task.related_tasks?.map((id) => (
              <p key={`ref-${id}`} className="mt-2 text-sm">
                Related to:{" "}
                {byId.has(id) ? `NEX-${id} · ${byId.get(id)!.title}` : "Restricted work item"}
              </p>
            ))}
          </article>
        ))}
        {!loading && !error && !items.length && (
          <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
            <GitBranch className="mx-auto mb-3 text-muted" size={30} />
            <h2 className="font-semibold">No dependencies yet</h2>
            <p className="mt-2 text-sm text-muted">
              {editableProjects.length
                ? "Create a dependency to connect work that must happen in order."
                : "A project owner, administrator or member can add dependencies."}
            </p>
          </div>
        )}
      </div>
      {creating && (
        <DependencyForm
          tasks={tasks}
          editableProjects={editableProjects}
          selectedProjectId={selectedId}
          onClose={() => setCreating(false)}
        />
      )}
    </PaddedPage>
  );
}

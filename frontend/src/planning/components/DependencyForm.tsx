import { useState, type FormEvent } from "react";
import { GitBranch, X } from "lucide-react";
import type { Project } from "../../common/entities/project";
import type { Task } from "../../features/tasks/entities/task";
import { createsCycle } from "../../features/tasks/utils/dependencies";
import { useDialogBehavior } from "../../common/shared/hooks/useDialogBehavior";
import { useSaveDependenciesMutation } from "../api/dependenciesQuery";
import { useToast } from "../../common/features/notifications/useToast";

interface DependencyFormProps {
  tasks: Task[];
  editableProjects: Project[];
  selectedProjectId: number | null;
  onClose: () => void;
}

export function DependencyForm({
  tasks,
  editableProjects,
  selectedProjectId,
  onClose,
}: DependencyFormProps) {
  const [projectId, setProjectId] = useState(selectedProjectId ?? editableProjects[0]?.id ?? null);
  const [taskId, setTaskId] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [save, { isLoading }] = useSaveDependenciesMutation();
  const toast = useToast();
  useDialogBehavior(onClose, isLoading);

  const task = tasks.find((item) => item.id === Number(taskId));
  const workItems = tasks.filter((item) => item.project === projectId);
  const candidates = tasks.filter(
    (item) =>
      item.id !== task?.id &&
      `NEX-${item.id} ${item.title} ${item.project_name ?? ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!task || !editableProjects.some((project) => project.id === task.project)) {
      setError("Choose a work item in a project you can edit.");
      return;
    }
    const ids = [...new Set([...task.blocked_by, ...selectedIds])];
    if (!selectedIds.length || ids.length === task.blocked_by.length) {
      setError("Choose at least one new prerequisite.");
      return;
    }
    if (createsCycle(tasks, task.id, ids)) {
      setError("These links would create a circular dependency.");
      return;
    }
    try {
      await save({ taskId: task.id, blockedBy: ids }).unwrap();
      toast("success", selectedIds.length === 1 ? "Dependency created." : "Dependencies created.");
      onClose();
    } catch (cause) {
      setError(
        cause && typeof cause === "object" && "message" in cause
          ? String(cause.message)
          : "Could not create this dependency.",
      );
    }
  }

  return (
    <div
      className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !isLoading) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dependency-form-title"
        className="max-h-[90dvh] w-full max-w-xl overflow-auto rounded-xl border border-line bg-surface p-6 text-content shadow-xl"
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2
              id="dependency-form-title"
              className="flex items-center gap-2 text-xl font-semibold"
            >
              <GitBranch size={20} className="text-accent" /> Create dependency
            </h2>
            <p className="mt-2 text-sm text-muted">Choose the work that must finish first.</p>
          </div>
          <button
            type="button"
            aria-label="Close dependency form"
            disabled={isLoading}
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-subtle"
          >
            <X size={20} />
          </button>
        </header>
        <form onSubmit={(event) => void submit(event)}>
          <fieldset disabled={isLoading} className="space-y-4 disabled:opacity-60">
            <label className="block text-sm font-medium">
              Project
              <select
                value={projectId ?? ""}
                onChange={(event) => {
                  setProjectId(Number(event.target.value));
                  setTaskId("");
                  setSelectedIds([]);
                  setError("");
                }}
                className="mt-1 w-full rounded-lg border border-line bg-canvas p-2.5"
              >
                {editableProjects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium">
              Work item
              <select
                required
                value={taskId}
                onChange={(event) => {
                  setTaskId(event.target.value);
                  setSelectedIds([]);
                  setError("");
                }}
                className="mt-1 w-full rounded-lg border border-line bg-canvas p-2.5"
              >
                <option value="">Select a work item</option>
                {workItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    NEX-{item.id} · {item.title}
                  </option>
                ))}
              </select>
            </label>
            {!workItems.length && (
              <p className="text-sm text-muted">This project has no work items yet.</p>
            )}
            <fieldset disabled={!task}>
              <legend className="text-sm font-medium">Depends on</legend>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search prerequisites"
                placeholder="Search by task ID, title or project…"
                className="my-2 w-full rounded-lg border border-line bg-canvas p-2.5 text-sm"
              />
              <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-line p-2">
                {candidates.map((candidate) => {
                  const linked = task?.blocked_by.includes(candidate.id) ?? false;
                  const circular = task ? createsCycle(tasks, task.id, [candidate.id]) : false;
                  return (
                    <label
                      key={candidate.id}
                      className="flex items-start gap-3 rounded-lg p-2 text-sm hover:bg-subtle"
                    >
                      <input
                        type="checkbox"
                        className="mt-1 accent-violet-600"
                        checked={linked || selectedIds.includes(candidate.id)}
                        disabled={linked || circular}
                        onChange={(event) =>
                          setSelectedIds((current) =>
                            event.target.checked
                              ? [...current, candidate.id]
                              : current.filter((id) => id !== candidate.id),
                          )
                        }
                      />
                      <span className="min-w-0">
                        <span className="block font-medium">
                          NEX-{candidate.id} · {candidate.title}
                        </span>
                        <span className="text-xs text-muted">
                          {candidate.project_name} · {candidate.status.replaceAll("_", " ")}
                          {linked ? " · Already linked" : circular ? " · Would create a cycle" : ""}
                        </span>
                      </span>
                    </label>
                  );
                })}
                {!candidates.length && (
                  <p className="p-3 text-sm text-muted">No other work items match your search.</p>
                )}
              </div>
              <p className="mt-2 text-xs text-muted">{selectedIds.length} selected</p>
            </fieldset>
          </fieldset>
          {error && (
            <p role="alert" className="mt-4 text-sm text-danger">
              {error}
            </p>
          )}
          <footer className="mt-5 flex justify-end gap-3">
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="rounded-lg border border-line px-4 py-2 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !task || !selectedIds.length}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {isLoading ? "Creating…" : "Create dependency"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

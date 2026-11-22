import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { dataScope } from "../../common/api/queryApi";
import { useSavePlanningMutation } from "../api/planningQuery";
import { useTasksQuery } from "../../features/tasks/api/tasksQuery";
import { useDialogBehavior } from "../../common/shared/hooks/useDialogBehavior";
import type { PlanningRecord } from "../entities/planning";
import { useProjectContext } from "../../common/features/projects/context/useProjectContext";
import { useToast } from "../../common/features/notifications/useToast";

const EMPTY: Omit<PlanningRecord, "id"> = {
  kind: "goal",
  name: "",
  description: "",
  status: "planned",
  target_date: null,
  tasks: [],
};
export function PlanningForm({
  kind,
  item,
  onClose,
}: {
  kind: PlanningRecord["kind"];
  item?: PlanningRecord;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Omit<PlanningRecord, "id">>(item ?? { ...EMPTY, kind });
  const [save, { isLoading }] = useSavePlanningMutation();
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const { projects, selectedId } = useProjectContext();
  const [projectId, setProjectId] = useState<number | null>(selectedId);
  const toast = useToast();
  const {
    currentData: tasks = [],
    isFetching: tasksLoading,
    error: tasksError,
    refetch,
  } = useTasksQuery({
    ...dataScope(),
    activeSprintOnly: false,
    boardId: null,
  });
  const visibleTasks = tasks.filter(
    (task) =>
      (!projectId || task.project === projectId) &&
      `NEX-${task.id} ${task.title} ${task.project_name ?? ""}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );
  useDialogBehavior(onClose, isLoading);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!values.name.trim()) {
      setError(`Enter a ${kind} name.`);
      return;
    }
    try {
      await save({
        id: item?.id,
        values: { ...values, name: values.name.trim(), description: values.description.trim() },
      }).unwrap();
      toast(
        "success",
        `${kind.charAt(0).toUpperCase() + kind.slice(1)} ${item ? "updated" : "created"}.`,
      );
      onClose();
    } catch (cause) {
      setError(
        cause && typeof cause === "object" && "message" in cause
          ? String(cause.message)
          : "Could not save this record.",
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
        aria-labelledby="planning-form-title"
        className="max-h-[90vh] w-full max-w-xl overflow-auto rounded-xl border border-line bg-surface p-6"
      >
        <header className="mb-4 flex items-start justify-between gap-3">
          <h2 id="planning-form-title" className="text-xl font-semibold">
            {item ? "Edit" : "Create"} {kind}
          </h2>
          <button
            type="button"
            aria-label={`Close ${kind} form`}
            disabled={isLoading}
            onClick={onClose}
            className="rounded p-1 text-muted hover:bg-subtle"
          >
            <X size={20} />
          </button>
        </header>
        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <fieldset disabled={isLoading} className="space-y-4 disabled:opacity-60">
            <label className="block text-sm">
              Name
              <input
                autoFocus
                required
                maxLength={160}
                placeholder={kind === "milestone" ? "e.g. Beta launch readiness" : undefined}
                value={values.name}
                onChange={(event) => setValues({ ...values, name: event.target.value })}
                className="mt-1 w-full rounded border border-line bg-canvas p-2"
              />
            </label>
            <label className="block text-sm">
              Description
              <textarea
                value={values.description}
                onChange={(event) => setValues({ ...values, description: event.target.value })}
                rows={4}
                className="mt-1 w-full rounded border border-line bg-canvas p-2"
              />
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="text-sm">
                Status
                <select
                  value={values.status}
                  onChange={(event) =>
                    setValues({ ...values, status: event.target.value as PlanningRecord["status"] })
                  }
                  className="mt-1 w-full rounded border border-line bg-canvas p-2"
                >
                  <option value="planned">Planned</option>
                  <option value="in_progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </label>
              <label className="text-sm">
                Target date
                <input
                  type="date"
                  value={values.target_date ?? ""}
                  onChange={(event) =>
                    setValues({ ...values, target_date: event.target.value || null })
                  }
                  className="mt-1 w-full rounded border border-line bg-canvas p-2"
                />
              </label>
            </div>
            <fieldset>
              <legend className="text-sm">Linked work items</legend>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <label className="text-xs text-muted">
                  Filter by project
                  <select
                    value={projectId ?? ""}
                    onChange={(event) =>
                      setProjectId(event.target.value ? Number(event.target.value) : null)
                    }
                    className="mt-1 w-full rounded border border-line bg-canvas p-2 text-sm text-content"
                  >
                    <option value="">All accessible projects</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs text-muted">
                  Search work items
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Task ID or title…"
                    className="mt-1 w-full rounded border border-line bg-canvas p-2 text-sm text-content"
                  />
                </label>
              </div>
              {tasksError && (
                <p role="alert" className="mt-2 text-sm text-danger">
                  Could not load work items.{" "}
                  <button type="button" onClick={() => void refetch()} className="underline">
                    Try again
                  </button>
                </p>
              )}
              <div className="mt-2 max-h-40 overflow-auto rounded border border-line p-2">
                {visibleTasks.map((task) => (
                  <label key={task.id} className="flex gap-2 py-1 text-xs">
                    <input
                      type="checkbox"
                      checked={values.tasks.includes(task.id)}
                      onChange={(event) =>
                        setValues({
                          ...values,
                          tasks: event.target.checked
                            ? [...values.tasks, task.id]
                            : values.tasks.filter((id) => id !== task.id),
                        })
                      }
                    />
                    <span>
                      NEX-{task.id} · {task.title}
                      <small className="block text-muted">{task.project_name}</small>
                    </span>
                  </label>
                ))}
                {tasksLoading && !tasks.length && (
                  <p role="status" className="text-sm text-muted">
                    Loading work items…
                  </p>
                )}
                {!tasksLoading && !tasksError && !visibleTasks.length && (
                  <p className="text-sm text-muted">No work items match this filter.</p>
                )}
              </div>
              <p className="mt-2 text-xs text-muted">
                {values.tasks.length} linked work items selected
              </p>
            </fieldset>
          </fieldset>
          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}
          <footer className="flex justify-end gap-3">
            <button type="button" disabled={isLoading} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !values.name.trim()}
              className="rounded bg-accent px-4 py-2 text-white disabled:opacity-50"
            >
              {isLoading ? "Saving…" : item ? "Save changes" : `Create ${kind}`}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

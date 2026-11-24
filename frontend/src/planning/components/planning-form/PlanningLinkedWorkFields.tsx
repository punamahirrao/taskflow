import type { usePlanningFormModel } from "../../features/planning-form/usePlanningFormModel";

export function PlanningLinkedWorkFields({
  model,
}: {
  model: ReturnType<typeof usePlanningFormModel>;
}) {
  const {
    values,
    setValues,
    search,
    setSearch,
    projects,
    projectId,
    setProjectId,
    tasks,
    tasksLoading,
    tasksError,
    refetch,
    visibleTasks,
  } = model;
  return (
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
      <p className="mt-2 text-xs text-muted">{values.tasks.length} linked work items selected</p>
    </fieldset>
  );
}

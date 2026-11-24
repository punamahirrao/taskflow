import { createsCycle } from "../../../features/tasks/utils/dependencies";
import type { useDependencyFormModel } from "../../features/dependency-form/useDependencyFormModel";

export function DependencyFields({ model }: { model: ReturnType<typeof useDependencyFormModel> }) {
  const {
    projectId,
    setProjectId,
    taskId,
    setTaskId,
    selectedIds,
    setSelectedIds,
    search,
    setSearch,
    setError,
    isLoading,
    task,
    workItems,
    candidates,
    tasks,
    editableProjects,
  } = model;
  return (
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
  );
}

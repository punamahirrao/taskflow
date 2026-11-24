import type { useReleaseFormModel } from "../../features/release-form/useReleaseFormModel";
function toggle(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}
export function ReleaseLinkedWorkFields({
  model,
}: {
  model: ReturnType<typeof useReleaseFormModel>;
}) {
  const {
    values,
    setValues,
    search,
    setSearch,
    goalSearch,
    setGoalSearch,
    tasks,
    shownTasks,
    shownGoals,
  } = model;
  return (
    <div className="release-form-row">
      <fieldset>
        <legend>Linked work items ({values.task_ids.length})</legend>
        <input
          type="search"
          aria-label="Find work items"
          placeholder="Find work items…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="release-check-list">
          {shownTasks.map((task) => (
            <label key={task.id}>
              <input
                type="checkbox"
                checked={values.task_ids.includes(task.id)}
                onChange={() =>
                  setValues({ ...values, task_ids: toggle(values.task_ids, task.id) })
                }
              />
              <span>
                {task.title}
                <small>{task.project_name}</small>
              </span>
            </label>
          ))}
          {!shownTasks.length && (
            <p>
              {tasks.isFetching
                ? "Loading work items…"
                : tasks.error
                  ? "Work items could not be loaded."
                  : "No matching work items."}
            </p>
          )}
        </div>
      </fieldset>
      <fieldset>
        <legend>Linked goals ({values.goal_ids.length})</legend>
        <input
          type="search"
          aria-label="Find goals"
          placeholder="Find goals…"
          value={goalSearch}
          onChange={(event) => setGoalSearch(event.target.value)}
        />
        <div className="release-check-list">
          {shownGoals.map((goal) => (
            <label key={goal.id}>
              <input
                type="checkbox"
                checked={values.goal_ids.includes(goal.id)}
                onChange={() =>
                  setValues({ ...values, goal_ids: toggle(values.goal_ids, goal.id) })
                }
              />
              {goal.name}
            </label>
          ))}
          {!shownGoals.length && <p>No matching goals.</p>}
        </div>
      </fieldset>
    </div>
  );
}

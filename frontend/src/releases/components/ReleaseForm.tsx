import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2, X } from "lucide-react";
import { dataScope } from "../../common/api/queryApi";
import { useTasksQuery } from "../../features/tasks/api/tasksQuery";
import { useSaveReleaseMutation } from "../api/releases";
import type { Approver, Release, ReleaseDraft, ReleaseGoal } from "../entities/release";

interface Props {
  release?: Release;
  members: Approver[];
  goals: ReleaseGoal[];
  onClose: () => void;
  onSaved: (release: Release) => void;
}

function toggle(ids: number[], id: number) {
  return ids.includes(id) ? ids.filter((value) => value !== id) : [...ids, id];
}

export function ReleaseForm({ release, members, goals, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState<ReleaseDraft>(() => ({
    name: release?.name ?? "",
    description: release?.description ?? "",
    target_date: release?.target_date ?? null,
    task_ids: release?.tasks.map((task) => task.id) ?? [],
    goal_ids: release?.goals.map((goal) => goal.id) ?? [],
    steps:
      release?.steps.map((step) => ({ name: step.name, approver_id: step.approver_id ?? 0 })) ?? [],
  }));
  const [search, setSearch] = useState("");
  const [goalSearch, setGoalSearch] = useState("");
  const [error, setError] = useState("");
  const [save, saveState] = useSaveReleaseMutation();
  const tasks = useTasksQuery({ ...dataScope(), boardId: null, activeSprintOnly: false });
  const shownTasks = (tasks.currentData ?? []).filter((task) =>
    `${task.title} ${task.project_name ?? ""}`.toLowerCase().includes(search.toLowerCase()),
  );
  const shownGoals = goals.filter((goal) =>
    goal.name.toLowerCase().includes(goalSearch.toLowerCase()),
  );

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  function moveStep(index: number, delta: number) {
    const steps = [...values.steps];
    const [step] = steps.splice(index, 1);
    steps.splice(index + delta, 0, step);
    setValues({ ...values, steps });
  }

  function editStep(index: number, changes: Partial<ReleaseDraft["steps"][number]>) {
    setValues({
      ...values,
      steps: values.steps.map((step, position) =>
        position === index ? { ...step, ...changes } : step,
      ),
    });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (saveState.isLoading) return;
    setError("");
    try {
      const saved = await save({ id: release?.id, values }).unwrap();
      onSaved(saved);
    } catch (cause) {
      setError(
        cause && typeof cause === "object" && "message" in cause
          ? String(cause.message)
          : "Could not save the release.",
      );
    }
  }

  return (
    <dialog
      ref={dialog}
      className="release-dialog"
      aria-labelledby="release-form-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!saveState.isLoading) onClose();
      }}
    >
      <header className="release-panel-heading">
        <h2 id="release-form-title">{release ? "Edit release" : "Create release"}</h2>
        <button
          type="button"
          className="release-icon"
          aria-label="Close release editor"
          disabled={saveState.isLoading}
          onClick={onClose}
        >
          <X size={19} />
        </button>
      </header>
      <form className="release-form" onSubmit={(event) => void submit(event)}>
        <div className="release-form-row">
          <label>
            Release name
            <input
              autoFocus
              required
              maxLength={160}
              value={values.name}
              onChange={(event) => setValues({ ...values, name: event.target.value })}
            />
          </label>
          <label>
            Target date
            <input
              type="date"
              value={values.target_date ?? ""}
              onChange={(event) =>
                setValues({ ...values, target_date: event.target.value || null })
              }
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            rows={2}
            value={values.description}
            maxLength={10000}
            onChange={(event) => setValues({ ...values, description: event.target.value })}
          />
        </label>
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
        <fieldset>
          <legend>Approval flow</legend>
          <p className="release-muted">
            Each approver reviews the release in order. Save a draft now or configure the steps
            before starting review.
          </p>
          {values.steps.map((step, index) => (
            <div key={index} className="release-step-input">
              <label>
                Step {index + 1}
                <input
                  required
                  maxLength={100}
                  value={step.name}
                  placeholder="e.g. Quality sign-off"
                  onChange={(event) => editStep(index, { name: event.target.value })}
                />
              </label>
              <label>
                Approver for step {index + 1}
                <select
                  required
                  value={step.approver_id || ""}
                  onChange={(event) => editStep(index, { approver_id: Number(event.target.value) })}
                >
                  <option value="">Choose an approver</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="release-actions">
                <button
                  type="button"
                  className="release-icon"
                  aria-label={`Move step ${index + 1} up`}
                  disabled={!index}
                  onClick={() => moveStep(index, -1)}
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  type="button"
                  className="release-icon"
                  aria-label={`Move step ${index + 1} down`}
                  disabled={index + 1 === values.steps.length}
                  onClick={() => moveStep(index, 1)}
                >
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  className="release-icon"
                  aria-label={`Remove step ${index + 1}`}
                  onClick={() =>
                    setValues({
                      ...values,
                      steps: values.steps.filter((_, position) => position !== index),
                    })
                  }
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            className="release-button"
            disabled={!members.length || values.steps.length >= 20}
            onClick={() =>
              setValues({ ...values, steps: [...values.steps, { name: "", approver_id: 0 }] })
            }
          >
            <Plus size={16} /> Add approval step
          </button>
        </fieldset>
        {error && (
          <p className="release-error" role="alert">
            {error}
          </p>
        )}
        <footer className="release-actions justify-end">
          <button
            type="button"
            className="release-button"
            disabled={saveState.isLoading}
            onClick={onClose}
          >
            Cancel
          </button>
          <button type="submit" className="release-button primary" disabled={saveState.isLoading}>
            {saveState.isLoading ? "Saving…" : release ? "Save release" : "Create release"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

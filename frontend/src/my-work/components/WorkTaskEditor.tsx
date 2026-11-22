import { useEffect, useRef, useState, type FormEvent } from "react";
import { X } from "lucide-react";
import type { Project } from "../../common/entities/project";
import type { Task, TaskPriority, WorkflowStatus } from "../../features/tasks/entities/task";
import { createTask, updateTask } from "../../features/tasks/api/tasks";
import { getProjectWorkflow } from "../../features/tasks/api/boards";
import { firstValidationError, taskSchema } from "../../common/validation/schemas";

interface Props {
  task?: Task;
  projects: Project[];
  userId: number;
  onClose: () => void;
  onSaved: (task: Task) => void;
}

export function WorkTaskEditor({ task, projects, userId, onClose, onSaved }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [projectId, setProjectId] = useState(task?.project ?? projects[0]?.id ?? 0);
  const [title, setTitle] = useState(task?.title ?? "");
  const [description, setDescription] = useState(task?.description ?? "");
  const [dueDate, setDueDate] = useState(task?.due_date ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [status, setStatus] = useState(task?.status ?? "backlog");
  const [statuses, setStatuses] = useState<WorkflowStatus[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [workflowError, setWorkflowError] = useState(false);
  const editing = Boolean(task);

  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);

  useEffect(() => {
    if (!editing || !projectId) return;
    let active = true;
    void getProjectWorkflow(projectId)
      .then((workflow) => {
        if (active) setStatuses(workflow.statuses);
      })
      .catch(() => {
        if (active) setWorkflowError(true);
      });
    return () => {
      active = false;
    };
  }, [editing, projectId]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || !projectId) return;
    const validationError = firstValidationError(taskSchema, { title, description, dueDate });
    if (validationError) {
      setError(validationError);
      return;
    }

    const values = {
      title: title.trim(),
      description: description.trim(),
      priority,
      due_date: dueDate || null,
    };
    setBusy(true);
    setError("");
    try {
      const saved = task
        ? await updateTask(task.id, { ...values, ...(status !== task.status ? { status } : {}) })
        : await createTask({
            ...values,
            project_id: projectId,
            assignee: userId,
            work_type: "task",
            status: "backlog",
          });
      onSaved(saved);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your task.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      className="my-work-dialog"
      aria-labelledby="my-work-task-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <header className="my-work-panel-heading">
        <h2 id="my-work-task-title">{task ? "Edit my task" : "Create my task"}</h2>
        <button
          type="button"
          className="my-work-icon-button"
          aria-label="Close task editor"
          disabled={busy}
          onClick={onClose}
        >
          <X size={19} />
        </button>
      </header>
      <form onSubmit={(event) => void submit(event)} className="my-work-form">
        <label>
          Title
          <input
            autoFocus
            required
            maxLength={255}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>
        {task ? (
          <p className="my-work-muted">
            {task.project_name ?? projects.find((project) => project.id === task.project)?.name}
          </p>
        ) : (
          <label>
            Project
            <select
              required
              value={projectId || ""}
              onChange={(event) => setProjectId(Number(event.target.value))}
            >
              <option value="" disabled>
                Choose a project
              </option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          Description
          <textarea
            rows={3}
            value={description}
            maxLength={10000}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="my-work-form-columns">
          <label>
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
            >
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label>
            Due date
            <input
              type="date"
              min={task?.planned_start_date ?? undefined}
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </label>
        </div>
        {task && (
          <label>
            Status
            <select
              value={status}
              disabled={!statuses.length}
              onChange={(event) => setStatus(event.target.value)}
            >
              {!statuses.some((item) => item.key === task.status) && (
                <option value={task.status}>{task.status.replaceAll("_", " ")}</option>
              )}
              {statuses.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        )}
        {workflowError && (
          <p className="my-work-muted">
            The workflow could not be loaded. You can still edit the task details.
          </p>
        )}
        {!task && <p className="my-work-muted">The task will be assigned to you.</p>}
        {error && (
          <p role="alert" className="text-danger">
            {error}
          </p>
        )}
        <footer className="my-work-actions">
          <button type="button" className="my-work-button" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="my-work-button primary" disabled={busy || !projectId}>
            {busy ? "Saving…" : task ? "Save changes" : "Create task"}
          </button>
        </footer>
      </form>
    </dialog>
  );
}

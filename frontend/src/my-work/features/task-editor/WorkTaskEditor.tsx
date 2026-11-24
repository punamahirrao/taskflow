import { useEffect, useState } from "react";
import type { TaskPriority, WorkflowStatus } from "../../../features/tasks/entities/task";
import { createTask, updateTask } from "../../../features/tasks/api/tasks";
import { getProjectWorkflow } from "../../../features/tasks/api/boards";
import { firstValidationError, taskSchema } from "../../../common/validation/schemas";
import type { WorkTaskEditorProps } from "../../entities/workTaskEditor";
import { WorkTaskEditorDialog } from "../../components/task-editor/WorkTaskEditorDialog";
import { WorkTaskEditorHeader } from "../../components/task-editor/WorkTaskEditorHeader";
import { WorkTaskEditorForm } from "../../components/task-editor/WorkTaskEditorForm";

export function WorkTaskEditor({ task, projects, userId, onClose, onSaved }: WorkTaskEditorProps) {
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

  async function submit() {
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
    <WorkTaskEditorDialog busy={busy} onClose={onClose}>
      <WorkTaskEditorHeader editing={editing} busy={busy} onClose={onClose} />
      <WorkTaskEditorForm
        task={task}
        projects={projects}
        title={title}
        description={description}
        dueDate={dueDate}
        priority={priority}
        status={status}
        projectId={projectId}
        statuses={statuses}
        busy={busy}
        error={error}
        workflowError={workflowError}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onDueDateChange={setDueDate}
        onPriorityChange={setPriority}
        onStatusChange={setStatus}
        onProjectChange={setProjectId}
        onSubmit={submit}
        onClose={onClose}
      />
    </WorkTaskEditorDialog>
  );
}

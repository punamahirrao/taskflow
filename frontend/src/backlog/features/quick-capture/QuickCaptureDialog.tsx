import { useState } from "react";
import { createTask } from "../../../features/tasks/api/tasks";
import type { TaskPriority, WorkType } from "../../../features/tasks/entities/task";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { firstValidationError, taskSchema } from "../../../common/validation/schemas";
import { useToast } from "../../../common/features/notifications/useToast";
import type { QuickCaptureDialogProps } from "../../entities/quickCapture";
import { QuickCapturePanel } from "../../components/quick-capture/QuickCapturePanel";
import { QuickCaptureHeader } from "../../components/quick-capture/QuickCaptureHeader";
import { QuickCaptureForm } from "../../components/quick-capture/QuickCaptureForm";
import { QuickCaptureTitleField } from "../../components/quick-capture/QuickCaptureTitleField";
import { QuickCaptureDescriptionField } from "../../components/quick-capture/QuickCaptureDescriptionField";
import { QuickCaptureFieldsGrid } from "../../components/quick-capture/QuickCaptureFieldsGrid";
import { QuickCaptureProject } from "../../components/quick-capture/QuickCaptureProject";
import { QuickCaptureWorkTypeField } from "../../components/quick-capture/QuickCaptureWorkTypeField";
import { QuickCapturePriorityField } from "../../components/quick-capture/QuickCapturePriorityField";
import { QuickCaptureTagsField } from "../../components/quick-capture/QuickCaptureTagsField";
import { QuickCaptureError } from "../../components/quick-capture/QuickCaptureError";
import { QuickCaptureActions } from "../../components/quick-capture/QuickCaptureActions";

export function QuickCaptureDialog({
  projects,
  defaultProjectId,
  onClose,
  onCreated,
}: QuickCaptureDialogProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workType, setWorkType] = useState<WorkType>("task");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [tagText, setTagText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const project = projects.find((item) => item.id === defaultProjectId);

  async function submit() {
    if (!project) {
      const message = t("backlog.errChooseProject");
      setError(message);
      toast("error", message);
      return;
    }
    const validationError = firstValidationError(taskSchema, { title, description });
    if (validationError) {
      setError(validationError);
      toast("error", validationError);
      return;
    }
    setSaving(true);
    try {
      const created = await createTask({
        project_id: project.id,
        title: title.trim(),
        description: description.trim(),
        status: "backlog",
        work_type: workType,
        priority,
        estimate: "",
        tags: tagText
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        rank: 0,
        blocked: false,
        ready_for_sprint: false,
        assignee: null,
        sprint: null,
        parent: null,
      });
      onCreated(created);
      toast("success", t("backlog.createdToast", { title: created.title }));
      onClose();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("backlog.errCapture");
      setError(message);
      toast("error", message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <QuickCapturePanel saving={saving} onClose={onClose}>
      <QuickCaptureHeader onClose={onClose} />
      <QuickCaptureForm onSubmit={submit}>
        <QuickCaptureTitleField value={title} onChange={setTitle} />
        <QuickCaptureDescriptionField value={description} onChange={setDescription} />
        <QuickCaptureFieldsGrid>
          <QuickCaptureProject project={project} />
          <QuickCaptureWorkTypeField value={workType} onChange={setWorkType} />
          <QuickCapturePriorityField value={priority} onChange={setPriority} />
          <QuickCaptureTagsField value={tagText} onChange={setTagText} />
        </QuickCaptureFieldsGrid>
        {error && <QuickCaptureError message={error} />}
        <QuickCaptureActions saving={saving} hasProject={Boolean(project)} onClose={onClose} />
      </QuickCaptureForm>
    </QuickCapturePanel>
  );
}

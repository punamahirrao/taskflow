import { useState } from "react";
import type { Project } from "../../../common/entities/project";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { firstValidationError, projectSchema } from "../../../common/validation/schemas";
import { useToast } from "../../../common/features/notifications/useToast";
import { createProject } from "../../api/projects";
import { ProjectDialogFrame } from "../../components/shared/ProjectDialogFrame";
import { CreateProjectDialogHeader } from "../../components/create-project/CreateProjectDialogHeader";
import CreateProjectFormContent from "../../components/create-project/CreateProjectFormContent";

interface CreateProjectProps {
  onClose: () => void;
  onCreated: (project: Project) => Promise<void> | void;
}

function CreateProject({ onClose, onCreated }: CreateProjectProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectStatus, setProjectStatus] = useState<Project["status"]>("in_progress");
  const [expectedStartDate, setExpectedStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const requestClose = () => {
    if (submitting) return;
    onClose();
  };

  const handleCreateProject = async () => {
    const validationError = firstValidationError(projectSchema, {
      name: projectName,
      status: projectStatus,
      expectedStartDate,
      endDate,
    });
    if (validationError) {
      setError(validationError);
      toast("error", validationError);
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (expectedStartDate && endDate && endDate < expectedStartDate) {
        setError(t("projects.dialog.endBeforeStart"));
        return;
      }
      const newProject = await createProject({
        name: projectName.trim(),
        description: projectDescription.trim(),
        status: projectStatus,
        expected_start_date: expectedStartDate || null,
        end_date: endDate || null,
      });
      setProjectName("");
      setProjectDescription("");
      await onCreated(newProject);
      toast("success", t("projects.dialog.createdToast", { name: newProject.name }));
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : t("projects.dialog.unableToCreate");
      setError(message);
      toast("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProjectDialogFrame titleId="create-project-title" busy={submitting} onClose={requestClose}>
      <CreateProjectDialogHeader submitting={submitting} onClose={requestClose} />
      <CreateProjectFormContent
        onSubmit={handleCreateProject}
        onCancel={requestClose}
        submitting={submitting}
        error={error}
        projectName={projectName}
        onProjectNameChange={setProjectName}
        projectStatus={projectStatus}
        onProjectStatusChange={setProjectStatus}
        projectDescription={projectDescription}
        onProjectDescriptionChange={setProjectDescription}
        expectedStartDate={expectedStartDate}
        onExpectedStartDateChange={setExpectedStartDate}
        endDate={endDate}
        onEndDateChange={setEndDate}
      />
    </ProjectDialogFrame>
  );
}
export default CreateProject;

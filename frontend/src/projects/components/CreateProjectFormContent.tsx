import type { FormEventHandler } from "react";
import type { Project } from "../../common/entities/project";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import ProjectDateField from "./ProjectDateField";
import ProjectDescriptionField from "./ProjectDescriptionField";
import ProjectNameField from "./ProjectNameField";
import ProjectStatusField from "./ProjectStatusField";
import {
  CreateProjectActions,
  CreateProjectCancelButton,
  CreateProjectError,
  CreateProjectFields,
  CreateProjectForm,
  CreateProjectSubmitButton,
} from "../Projects.styles";

interface CreateProjectFormContentProps {
  onSubmit: FormEventHandler<HTMLFormElement>;
  onCancel: () => void;
  submitting: boolean;
  error: string;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  projectStatus: Project["status"];
  onProjectStatusChange: (value: Project["status"]) => void;
  projectDescription: string;
  onProjectDescriptionChange: (value: string) => void;
  expectedStartDate: string;
  onExpectedStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
}

export default function CreateProjectFormContent({
  onSubmit,
  onCancel,
  submitting,
  error,
  projectName,
  onProjectNameChange,
  projectStatus,
  onProjectStatusChange,
  projectDescription,
  onProjectDescriptionChange,
  expectedStartDate,
  onExpectedStartDateChange,
  endDate,
  onEndDateChange,
}: CreateProjectFormContentProps) {
  const { t } = useTranslation();

  return (
    <CreateProjectForm onSubmit={onSubmit}>
      <CreateProjectFields>
        <ProjectNameField value={projectName} onChange={onProjectNameChange} />
        <ProjectStatusField value={projectStatus} onChange={onProjectStatusChange} />
        <ProjectDescriptionField value={projectDescription} onChange={onProjectDescriptionChange} />
        <ProjectDateField
          id="project-start-date"
          testId="project-start-date-label"
          inputTestId="project-start-date-input"
          label="projects.dialog.expectedStartDate"
          value={expectedStartDate}
          onChange={onExpectedStartDateChange}
        />
        <ProjectDateField
          id="project-end-date"
          testId="project-end-date-label"
          inputTestId="project-end-date-input"
          label="projects.dialog.endDate"
          value={endDate}
          onChange={onEndDateChange}
          min={expectedStartDate || undefined}
        />
      </CreateProjectFields>

      {error && <CreateProjectError>{error}</CreateProjectError>}

      <CreateProjectActions>
        <CreateProjectCancelButton type="button" onClick={onCancel} disabled={submitting}>
          {t("projects.dialog.cancel")}
        </CreateProjectCancelButton>
        <CreateProjectSubmitButton type="submit" disabled={submitting}>
          {submitting ? t("projects.dialog.creating") : t("projects.dialog.submit")}
        </CreateProjectSubmitButton>
      </CreateProjectActions>
    </CreateProjectForm>
  );
}

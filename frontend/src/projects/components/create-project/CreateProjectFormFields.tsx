import type { CreateProjectFormContentProps } from "../../entities/createProject";
import ProjectDateField from "./ProjectDateField";
import ProjectDescriptionField from "./ProjectDescriptionField";
import ProjectNameField from "./ProjectNameField";
import ProjectStatusField from "./ProjectStatusField";
import { CreateProjectFields } from "../../Projects.styles";

export function CreateProjectFormFields({
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
}: Omit<CreateProjectFormContentProps, "onSubmit" | "onCancel" | "submitting" | "error">) {
  return (
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
  );
}

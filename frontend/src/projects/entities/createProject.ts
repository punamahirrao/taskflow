import type { Project } from "../../common/entities/project";

export interface CreateProjectFormContentProps {
  onSubmit: () => Promise<void>;
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

import type { Project } from "../../common/entities/project";
import type { AgileBoard, AgileBoardType } from "../../features/tasks/entities/task";

export interface BoardFormValues {
  name: string;
  description: string;
  project: string;
  type: AgileBoardType;
  members: number[];
}
export interface BoardFormProps {
  projects: Project[];
  values: BoardFormValues;
  editing: AgileBoard | null;
  busy: boolean;
  error: string;
  onChange: (values: Partial<BoardFormValues>) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

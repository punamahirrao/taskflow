import type { Project } from "../../common/entities/project";
import type { Task } from "../../features/tasks/entities/task";

export interface QuickCaptureDialogProps {
  projects: Project[];
  defaultProjectId: number | null;
  onClose: () => void;
  onCreated: (task: Task) => void;
}

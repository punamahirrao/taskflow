import type { Project } from "../../common/entities/project";
import type { Task, TaskPriority, WorkflowStatus } from "../../features/tasks/entities/task";
export interface WorkTaskEditorProps {
  task?: Task;
  projects: Project[];
  userId: number;
  onClose: () => void;
  onSaved: (task: Task) => void;
}
export interface WorkTaskEditorFormProps {
  task?: Task;
  projects: Project[];
  title: string;
  description: string;
  dueDate: string;
  priority: TaskPriority;
  status: string;
  projectId: number;
  statuses: WorkflowStatus[];
  busy: boolean;
  error: string;
  workflowError: boolean;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDueDateChange: (value: string) => void;
  onPriorityChange: (value: TaskPriority) => void;
  onStatusChange: (value: string) => void;
  onProjectChange: (value: number) => void;
  onSubmit: () => Promise<void>;
  onClose: () => void;
}

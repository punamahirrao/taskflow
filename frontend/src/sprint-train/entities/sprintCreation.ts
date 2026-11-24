import type { Project } from "../../common/entities/project";
export interface SprintCreationProps {
  project: Project | null;
  hasProjectSelection: boolean;
  name: string;
  start: string;
  end: string;
  goal: string;
  capacity: string;
  active: boolean;
  saving: boolean;
  error: string;
  onName: (value: string) => void;
  onStart: (value: string) => void;
  onEnd: (value: string) => void;
  onGoal: (value: string) => void;
  onCapacity: (value: string) => void;
  onActive: (value: boolean) => void;
  onClose: () => void;
  onSubmit: () => Promise<void>;
}

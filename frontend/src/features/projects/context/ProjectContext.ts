import { createContext } from "react";
import type { Project } from "../../../entities/project";

export type ProjectContextValue = {
  projects: Project[];
  loading: boolean;
  error: string;
  reload: () => Promise<void>;
  selectedId: number | null;
  select: (projectId: number | null) => void;
  setDefault: (projectId: number | null) => Promise<void>;
};

export const ProjectContext = createContext<ProjectContextValue | null>(null);

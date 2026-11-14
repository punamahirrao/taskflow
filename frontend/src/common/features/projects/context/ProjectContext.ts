import { createContext } from "react";
import type { ProjectContextValue } from "../../../entities/project";

export type { ProjectContextValue };
export const ProjectContext = createContext<ProjectContextValue | null>(null);

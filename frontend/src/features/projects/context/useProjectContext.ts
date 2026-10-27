import { useContext } from "react";
import { ProjectContext } from "./ProjectContext";

export function useProjectContext() {
  const value = useContext(ProjectContext);
  if (!value) throw new Error("useProjectContext must be used within ProjectProvider.");
  return value;
}

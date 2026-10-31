import { useState } from "react";
import { useProjectContext } from "../../projects/context/useProjectContext";

export function useAgileProjectScope(storageKey: string) {
  const { projects } = useProjectContext();
  const [storedProject, setStoredProject] = useState(() => sessionStorage.getItem(storageKey) ?? "all");
  const selectedId = storedProject === "all" ? null : Number(storedProject);
  const projectId = selectedId !== null && projects.some((project) => project.id === selectedId) ? selectedId : null;
  const selectProject = (value: string) => {
    sessionStorage.setItem(storageKey, value);
    setStoredProject(value);
  };
  return { projects, projectId, selectProject, project: projects.find((item) => item.id === projectId) ?? null };
}

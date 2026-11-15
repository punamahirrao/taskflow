import { useProjectContext } from "../../projects/context/useProjectContext";

export function useAgileProjectScope(_storageKey?: string) {
  const { projects, selectedId: projectId } = useProjectContext();
  return { projects, projectId, project: projects.find((item) => item.id === projectId) ?? null };
}

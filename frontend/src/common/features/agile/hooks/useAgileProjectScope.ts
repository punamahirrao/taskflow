import { useProjectContext } from "../../projects/context/useProjectContext";

export function useAgileProjectScope() {
  const { projects, selectedId: projectId } = useProjectContext();
  return { projects, projectId, project: projects.find((item) => item.id === projectId) ?? null };
}

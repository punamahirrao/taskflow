import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";

export function useRoadmapPageModel() {
  const { projects, selectedId, select, loading, error } = useProjectContext();
  const project = projects.find((item) => item.id === selectedId);

  return { projects, select, loading, error, project };
}

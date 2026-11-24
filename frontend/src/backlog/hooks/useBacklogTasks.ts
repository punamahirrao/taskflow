import { useAgileTasks } from "../../features/tasks/hooks/useAgileTasks";

export function useBacklogTasks(projectId: number | null) {
  return useAgileTasks(projectId);
}

import { useAgileTasks } from "../../../../features/tasks/hooks/useAgileTasks";
import { translate } from "../../../../common/shared/i18n/translate";
export function useProjectTasks(projectId: number | string | undefined) {
  const agile = useAgileTasks(Number(projectId) || null, false, null, Boolean(projectId));
  return {
    ...agile,
    error: projectId ? agile.error : translate("projectDetail.notFound"),
    moveTask: agile.move,
  };
}

import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { Task } from "../../../features/tasks/entities/task";
import { points } from "../../utils/sprintTrain";

export function BacklogStoryPoints({ task }: { task: Task }) {
  const { t } = useTranslation();
  return (
    <span className="whitespace-nowrap rounded-full bg-amber-500/20 px-2 py-0.5 text-[calc(10px*var(--taskflow-font-scale,1))] font-bold text-amber-300">
      {t("sprintTrain.points", { points: points(task) })}
    </span>
  );
}

import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { Sprint } from "../../../features/tasks/entities/task";

export function SprintPipelineCardStats({
  sprint,
  storyCount,
  totalPoints,
}: {
  sprint: Sprint;
  storyCount: number;
  totalPoints: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="mt-2 grid grid-cols-2 gap-2">
      <div className="rounded-lg bg-slate-50 px-2 py-1.5">
        <p className="text-[calc(9px*var(--taskflow-font-scale,1))] font-semibold uppercase                   text-slate-500">
          {t("sprintTrain.stories")}
        </p>
        <p className="text-xs font-bold">{storyCount}</p>
      </div>
      <div className="rounded-lg bg-slate-50 px-2 py-1.5">
        <p className="text-[calc(9px*var(--taskflow-font-scale,1))] font-semibold uppercase text-slate-500">
          {t("sprintTrain.pointsCapacity")}
        </p>
        <p className="text-xs font-bold">
          {t("sprintTrain.pointsOfCapacity", {
            points: totalPoints,
            capacity: sprint.capacity_points ?? "—",
          })}
        </p>
      </div>
    </div>
  );
}

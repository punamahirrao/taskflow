import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { Sprint } from "../../../features/tasks/entities/task";

export function SprintPipelineCardHeading({
  sprint,
  sprintProjectName,
  showProjectName,
}: {
  sprint: Sprint;
  sprintProjectName?: string;
  showProjectName: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[calc(10px*var(--taskflow-font-scale,1))] font-bold uppercase tracking-[.15em] text-indigo-600">
          {sprint.is_closed
            ? t("sprintTrain.completedSprint")
            : sprint.is_active
              ? t("sprintTrain.activeSprint")
              : t("sprintTrain.upcomingSprint")}
        </p>
        <h2 className="mt-1 font-bold text-slate-900">{sprint.name}</h2>
        {showProjectName && sprintProjectName && (
          <p className="mt-1 text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-500">
            {sprintProjectName}
          </p>
        )}
      </div>
    </div>
  );
}

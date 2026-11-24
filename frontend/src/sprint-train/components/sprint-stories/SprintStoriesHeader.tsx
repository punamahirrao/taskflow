import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ReactNode } from "react";
import type { Sprint } from "../../../features/tasks/entities/task";

export function SprintStoriesHeader({
  sprint,
  totalPoints,
  children,
}: {
  sprint: Sprint | null;
  totalPoints: number;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <header className="border-b border-slate-200 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="sprint-stories-heading">
          <h2 className="font-bold text-slate-900">
            {sprint
              ? t("sprintTrain.sprintStoriesListFor", { name: sprint.name })
              : t("sprintTrain.sprintStoriesList")}
          </h2>
          {children}
        </div>
        {sprint && (
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
            {t("sprintTrain.points", { points: totalPoints })}
          </span>
        )}
      </div>
    </header>
  );
}

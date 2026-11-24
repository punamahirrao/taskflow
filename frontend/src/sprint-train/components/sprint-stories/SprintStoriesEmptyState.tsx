import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SprintStoriesEmptyState({ hasSprint }: { hasSprint: boolean }) {
  const { t } = useTranslation();
  return (
    <p className="p-8 text-center text-sm text-slate-500">
      {hasSprint ? t("sprintTrain.noStoriesInSprint") : t("sprintTrain.selectSprintToViewStories")}
    </p>
  );
}

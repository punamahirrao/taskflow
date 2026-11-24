import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SelectedSprintPoints({ points }: { points: number }) {
  const { t } = useTranslation();
  return (
    <div className="sprint-backlog-points">
      <p>{t("sprintTrain.selectedSprintPoints")}</p>
      <strong>{t("sprintTrain.points", { points })}</strong>
    </div>
  );
}

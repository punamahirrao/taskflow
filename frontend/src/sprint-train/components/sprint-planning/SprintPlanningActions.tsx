import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SprintPlanningActions({ busy, onCancel }: { busy: boolean; onCancel: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="sprint-planning-actions">
      <button type="button" disabled={busy} onClick={onCancel}>
        {t("common.cancel")}
      </button>
      <button type="submit" disabled={busy} aria-label={t("sprintTrain.saveSprintDetails")}>
        {t(busy ? "common.saving" : "common.save")}
      </button>
    </div>
  );
}

import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SprintPlanningGoalField({
  goal,
  busy,
  autoFocus,
  onChange,
}: {
  goal: string;
  busy: boolean;
  autoFocus: boolean;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label>
      {t("sprintTrain.sprintGoal")}
      <textarea
        rows={2}
        value={goal}
        disabled={busy}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

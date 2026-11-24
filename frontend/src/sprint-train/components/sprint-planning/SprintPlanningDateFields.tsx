import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SprintPlanningDateFields({
  start,
  end,
  busy,
  autoFocus,
  onStart,
  onEnd,
}: {
  start: string;
  end: string;
  busy: boolean;
  autoFocus: boolean;
  onStart: (value: string) => void;
  onEnd: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="sprint-planning-dates">
      <label>
        {t("sprintTrain.startDate")}
        <input
          type="date"
          value={start}
          disabled={busy}
          autoFocus={autoFocus}
          onChange={(event) => onStart(event.target.value)}
        />
      </label>
      <label>
        {t("sprintTrain.endDate")}
        <input
          type="date"
          value={end}
          min={start || undefined}
          disabled={busy}
          onChange={(event) => onEnd(event.target.value)}
        />
      </label>
    </div>
  );
}

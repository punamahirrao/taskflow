import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { SprintCreationProps } from "../../entities/sprintCreation";

export function CreateSprintDateFields({
  start,
  end,
  onStart,
  onEnd,
}: Pick<SprintCreationProps, "start" | "end" | "onStart" | "onEnd">) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="block text-sm font-medium text-slate-700">
        {t("sprintTrain.startDate")}
        <input
          type="date"
          value={start}
          onChange={(event) => onStart(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
        />
      </label>
      <label className="block text-sm font-medium text-slate-700">
        {t("sprintTrain.endDate")}
        <input
          type="date"
          value={end}
          min={start || undefined}
          onChange={(event) => onEnd(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5"
        />
      </label>
    </div>
  );
}

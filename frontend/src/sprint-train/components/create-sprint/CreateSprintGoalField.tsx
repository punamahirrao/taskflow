import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function CreateSprintGoalField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="block text-sm font-medium text-slate-700">
      {t("sprintTrain.sprintGoal")}
      <textarea
        maxLength={255}
        rows={2}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5"
      />
    </label>
  );
}

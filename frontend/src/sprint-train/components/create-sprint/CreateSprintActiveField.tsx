import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function CreateSprintActiveField({
  active,
  onChange,
}: {
  active: boolean;
  onChange: (value: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="flex items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm text-slate-700">
      <input
        type="checkbox"
        checked={active}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5"
      />
      <span>
        <span className="block font-medium">{t("sprintTrain.startAsActive")}</span>
        <span className="text-xs">{t("sprintTrain.plannedSprintHint")}</span>
      </span>
    </label>
  );
}

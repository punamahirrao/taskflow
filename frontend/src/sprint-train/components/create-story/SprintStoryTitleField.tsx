import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SprintStoryTitleField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="block text-xs font-medium">
      {t("sprintTrain.title")}
      <input
        required
        maxLength={255}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm"
      />
    </label>
  );
}

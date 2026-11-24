import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function SprintStoryDescriptionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="block text-xs font-medium">
      {t("sprintTrain.description")}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={2}
        className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm"
      />
    </label>
  );
}

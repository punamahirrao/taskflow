import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function QuickCaptureDescriptionField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="block text-sm font-medium text-slate-700">
      {t("backlog.description")}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        placeholder={t("backlog.descriptionPlaceholder")}
        className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-violet-300"
      />
    </label>
  );
}

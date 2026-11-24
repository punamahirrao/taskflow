import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function QuickCaptureTitleField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="block text-sm font-medium text-slate-700">
      {t("backlog.titleField")}
      <input
        autoFocus
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={t("backlog.titlePlaceholder")}
        className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-violet-300"
      />
    </label>
  );
}

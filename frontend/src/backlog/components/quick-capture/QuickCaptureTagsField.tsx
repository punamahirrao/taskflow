import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function QuickCaptureTagsField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="text-sm font-medium text-slate-700">
      {t("backlog.tags")}
      <span className="mt-1.5 flex rounded-lg border border-slate-200 px-3 py-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t("backlog.tagsPlaceholder")}
          className="w-full outline-none"
        />
      </span>
    </label>
  );
}

import type { TranslationKey } from "../../../common/entities/language";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BacklogGroupBy } from "../../features/agile/utils/backlog";

const GROUP_OPTIONS: [BacklogGroupBy, TranslationKey][] = [
  ["project", "backlog.project"],
  ["theme", "backlog.themeTag"],
  ["parent", "backlog.epicInitiative"],
];

export function BacklogGroupSelect({
  value,
  onChange,
}: {
  value: BacklogGroupBy;
  onChange: (value: BacklogGroupBy) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      {t("backlog.group")}
      <select
        aria-label={t("backlog.groupByAria")}
        value={value}
        onChange={(event) => onChange(event.target.value as BacklogGroupBy)}
        className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700"
      >
        {GROUP_OPTIONS.map(([option, labelKey]) => (
          <option key={option} value={option}>
            {t(labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}

import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function ProjectStatusFilter({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <select
      aria-label={t("projects.filterStatus")}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="all">{t("projects.allStatuses")}</option>
      <option value="in_progress">{t("projects.statusInProgress")}</option>
      <option value="upcoming">{t("projects.statusUpcoming")}</option>
      <option value="archived">{t("projects.statusArchived")}</option>
    </select>
  );
}

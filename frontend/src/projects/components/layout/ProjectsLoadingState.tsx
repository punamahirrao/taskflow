import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function ProjectsLoadingState() {
  const { t } = useTranslation();
  return (
    <p role="status" className="mb-3 text-sm text-muted">
      {t("projects.loading")}
    </p>
  );
}

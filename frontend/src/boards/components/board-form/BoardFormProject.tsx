import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BoardFormProject({ name }: { name: string }) {
  const { t } = useTranslation();
  return (
    <p className="text-sm text-muted">
      {t("app.project")}: <span className="font-semibold text-content">{name}</span>
    </p>
  );
}

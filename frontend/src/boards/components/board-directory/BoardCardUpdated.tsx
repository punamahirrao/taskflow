import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BoardCardUpdated({ updatedAt }: { updatedAt: string }) {
  const { t } = useTranslation();
  return (
    <small className="mt-3 text-xs text-muted">
      {t("boards.lastUpdated", { date: new Date(updatedAt).toLocaleDateString() })}
    </small>
  );
}

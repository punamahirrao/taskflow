import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BoardDirectoryLoading() {
  const { t } = useTranslation();
  return (
    <p
      role="status"
      className="rounded-xl border border-line bg-surface p-12 text-center text-sm text-muted"
    >
      {t("common.loading")}
    </p>
  );
}

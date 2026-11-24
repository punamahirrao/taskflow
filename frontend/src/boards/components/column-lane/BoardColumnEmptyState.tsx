import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BoardColumnEmptyState() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-24 items-center justify-center rounded-lg border border-dashed border-line px-3 py-6 text-center text-[calc(11px*var(--taskflow-font-scale,1))] text-muted">
      {t("boards.noStatusesInColumn")}
    </div>
  );
}

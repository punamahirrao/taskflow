import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BoardBackButton({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onBack}
      className="rounded-lg border border-line bg-surface px-3 py-2 text-sm text-content"
    >
      {t("boards.backToBoards")}
    </button>
  );
}

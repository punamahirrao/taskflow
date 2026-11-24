import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BoardWipWarning() {
  const { t } = useTranslation();
  return (
    <p
      role="alert"
      className="mb-2 rounded-lg border border-danger/30 bg-danger-soft px-2 py-1.5 text-[calc(10px*var(--taskflow-font-scale,1))] font-semibold text-danger"
    >
      {t("boards.wipExceeded")}
    </p>
  );
}

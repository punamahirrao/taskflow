import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BoardWorkflowLoading({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-2xl border border-line bg-surface p-14 text-center text-sm text-muted">
      {loading ? t("boards.loadingFlow") : t("boards.settingUpWorkflow")}
    </div>
  );
}

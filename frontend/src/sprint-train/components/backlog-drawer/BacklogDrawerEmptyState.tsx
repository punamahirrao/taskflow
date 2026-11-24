import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function BacklogDrawerEmptyState({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">
      {loading ? t("sprintTrain.loadingBacklog") : t("sprintTrain.noBacklogMatches")}
    </div>
  );
}

import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { TrainFront } from "lucide-react";

export function SprintPipelineEmptyState({ loading }: { loading: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="col-span-full rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <TrainFront className="mx-auto text-slate-400" size={28} />
      <p className="mt-3 font-semibold">{t("sprintTrain.noSprints")}</p>
      <p className="mt-1 text-sm text-slate-500">
        {loading ? t("sprintTrain.loadingProjectWork") : t("sprintTrain.createSprintHint")}
      </p>
    </div>
  );
}

import { BrainCircuit } from "lucide-react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

export function EstimatorPageHeader() {
  const { t } = useTranslation();

  return (
    <header className="mb-7 flex items-start gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white">
        <BrainCircuit size={24} />
      </span>
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">
          {t("aiEstimator.planningAssistant")}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">{t("app.aiEstimator")}</h1>
        <p className="mt-1 text-sm text-slate-500">{t("aiEstimator.subtitle")}</p>
      </div>
    </header>
  );
}

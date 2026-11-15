import { Check } from "lucide-react";
import type { TranslationKey } from "../../common/entities/language";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

interface EstimatorStepNavigationProps {
  step: "upload" | "pipeline" | "results" | "deep-analysis";
  labels: TranslationKey[];
}

export function EstimatorStepNavigation({ step, labels }: EstimatorStepNavigationProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-6 grid grid-cols-2 gap-3" aria-label={t("aiEstimator.stepsAria")}>
      {labels.map((label, index) => {
        const active = (step === "upload" && index === 0) || (step !== "upload" && index === 1);
        const done = step !== "upload" && index === 0;
        return (
          <div key={label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${active ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}>
            <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${active ? "bg-indigo-600 text-white" : done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{done ? <Check size={15} /> : index + 1}</span>
            <span className={`text-sm font-semibold ${active ? "text-indigo-900" : "text-slate-600"}`}>{t(label)}</span>
          </div>
        );
      })}
    </div>
  );
}

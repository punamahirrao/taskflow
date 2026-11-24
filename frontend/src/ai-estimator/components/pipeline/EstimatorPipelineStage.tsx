import { Check, Circle, LoaderCircle } from "lucide-react";
import { PIPELINE_STEPS } from "../../features/estimatorData";
import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";

export function EstimatorPipelineStage({
  model,
  item,
  done,
  active,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
  item: (typeof PIPELINE_STEPS)[number];
  done: boolean;
  active: boolean;
}) {
  const { t } = model;
  return (
    <li key={item.titleKey} className="relative pb-7 pl-8 last:pb-0">
      <span
        className={`absolute -left-[17px] top-0 grid size-8 place-items-center rounded-full border-4 border-white ${done ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}
      >
        {done ? (
          <Check size={14} />
        ) : active ? (
          <LoaderCircle className="animate-spin" size={14} />
        ) : (
          <Circle size={12} />
        )}
      </span>
      <p
        className={`text-sm font-semibold ${done ? "text-emerald-700" : active ? "text-indigo-700" : "text-slate-400"}`}
      >
        {t(item.titleKey)}
      </p>
      <p className="mt-1 text-xs text-slate-500">
        {done
          ? t("aiEstimator.stepDetailComplete", { detail: t(item.detailKey) })
          : t(item.detailKey)}
      </p>
    </li>
  );
}

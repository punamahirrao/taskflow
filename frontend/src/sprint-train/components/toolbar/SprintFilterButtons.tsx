import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { SprintFilter } from "../../entities/sprintTrain";
import type { TranslationKey } from "../../../common/entities/language";

const sprintFilterLabelKeys: Record<SprintFilter, TranslationKey> = {
  all: "sprintTrain.filterAll",
  active: "sprintTrain.filterActive",
  future: "sprintTrain.filterFuture",
};

export function SprintFilterButtons({
  value,
  onChange,
}: {
  value: SprintFilter;
  onChange: (filter: SprintFilter) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex rounded-lg border border-slate-200 p-0.5">
      {(["all", "active", "future"] as const).map((filter) => (
        <button
          key={filter}
          type="button"
          onClick={() => onChange(filter)}
          className={`rounded-md px-2.5 py-1.5 text-xs font-semibold capitalize ${value === filter ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
        >
          {t(sprintFilterLabelKeys[filter])}
        </button>
      ))}
    </div>
  );
}

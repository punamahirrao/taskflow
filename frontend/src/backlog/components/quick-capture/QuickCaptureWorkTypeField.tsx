import type { TranslationKey } from "../../../common/entities/language";
import type { WorkType } from "../../../features/tasks/entities/task";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

const TYPES: [WorkType, TranslationKey][] = [
  ["story", "backlog.typeStory"],
  ["initiative", "backlog.typeInitiative"],
  ["epic", "backlog.typeEpic"],
  ["task", "backlog.typeTask"],
  ["idea", "backlog.typeIdea"],
  ["enhancement", "backlog.typeEnhancement"],
  ["bug", "backlog.typeBug"],
  ["spike", "backlog.typeSpike"],
  ["research", "backlog.typeResearch"],
];

export function QuickCaptureWorkTypeField({
  value,
  onChange,
}: {
  value: WorkType;
  onChange: (value: WorkType) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="text-sm font-medium text-slate-700">
      {t("backlog.workType")}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as WorkType)}
        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5"
      >
        {TYPES.map(([type, labelKey]) => (
          <option key={type} value={type}>
            {t(labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}

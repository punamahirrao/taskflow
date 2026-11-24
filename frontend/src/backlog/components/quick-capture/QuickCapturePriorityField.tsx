import type { TranslationKey } from "../../../common/entities/language";
import type { TaskPriority } from "../../../features/tasks/entities/task";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";

const PRIORITIES: [TaskPriority, TranslationKey][] = [
  ["urgent", "backlog.priorityUrgent"],
  ["high", "backlog.priorityHigh"],
  ["medium", "backlog.priorityMedium"],
  ["low", "backlog.priorityLow"],
];

export function QuickCapturePriorityField({
  value,
  onChange,
}: {
  value: TaskPriority;
  onChange: (value: TaskPriority) => void;
}) {
  const { t } = useTranslation();
  return (
    <label className="text-sm font-medium text-slate-700">
      {t("backlog.priority")}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as TaskPriority)}
        className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5"
      >
        {PRIORITIES.map(([priority, labelKey]) => (
          <option key={priority} value={priority}>
            {t(labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}

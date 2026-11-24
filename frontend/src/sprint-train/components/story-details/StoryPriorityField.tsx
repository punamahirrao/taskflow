import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { TranslationKey } from "../../../common/entities/language";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import type { Task } from "../../../features/tasks/entities/task";
const priorityLabelKeys: Record<Task["priority"], TranslationKey> = {
  urgent: "sprintTrain.priorityUrgent",
  high: "sprintTrain.priorityHigh",
  medium: "sprintTrain.priorityMedium",
  low: "sprintTrain.priorityLow",
};

export function StoryPriorityField({
  task,
  onUpdate,
}: Pick<SprintStoryDetailsDrawerProps, "task" | "onUpdate">) {
  const { t } = useTranslation();
  return (
    <label
      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${task.priority === "urgent" || task.priority === "high" ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-700"}`}
      title={t("sprintTrain.clickToEditPriority")}
    >
      <span className="sr-only">{t("sprintTrain.priority")}</span>
      <select
        aria-label={t("sprintTrain.editTaskPriority")}
        value={task.priority}
        onChange={(event) => onUpdate({ priority: event.target.value as Task["priority"] })}
        className="cursor-pointer appearance-none bg-transparent outline-none"
      >
        {(["urgent", "high", "medium", "low"] as const).map((priority) => (
          <option key={priority} value={priority}>
            {t(priorityLabelKeys[priority])}
          </option>
        ))}
      </select>
    </label>
  );
}

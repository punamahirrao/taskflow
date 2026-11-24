import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { TranslationKey } from "../../../common/entities/language";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";

const statusLabelKeys: Record<string, TranslationKey> = {
  backlog: "app.backlog",
  todo: "sprintTrain.statusTodo",
  in_progress: "sprintTrain.statusInProgress",
  review: "sprintTrain.statusReview",
  waiting: "sprintTrain.statusWaiting",
  done: "sprintTrain.statusDone",
};

export function StoryStatusField({
  task,
  onUpdate,
}: Pick<SprintStoryDetailsDrawerProps, "task" | "onUpdate">) {
  const { t } = useTranslation();
  return (
    <label
      className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700"
      title={t("sprintTrain.clickToEditStatus")}
    >
      <span className="sr-only">{t("sprintTrain.status")}</span>
      <select
        aria-label={t("sprintTrain.editTaskStatus")}
        value={task.status}
        onChange={(event) => onUpdate({ status: event.target.value })}
        className="cursor-pointer appearance-none bg-transparent outline-none"
      >
        {Object.entries(statusLabelKeys).map(([status, labelKey]) => (
          <option key={status} value={status}>
            {t(labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}

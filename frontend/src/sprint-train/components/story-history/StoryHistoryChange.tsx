import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { TaskHistoryEntry } from "../../../features/tasks/entities/taskActivity";
import { formatHistoryValue } from "../../utils/storyHistory";

export function StoryHistoryChange({
  field,
  change,
}: {
  field: string;
  change: TaskHistoryEntry["changes"][string];
}) {
  const { t } = useTranslation();
  return (
    <li>
      <span className="font-medium capitalize">{field.replaceAll("_", " ")}</span>:{" "}
      {change.old === undefined
        ? t("sprintTrain.historyAdded")
        : t("sprintTrain.historyChangedFrom", {
            value: formatHistoryValue(change.old),
          })}
      {change.new !== undefined && formatHistoryValue(change.new)}
    </li>
  );
}

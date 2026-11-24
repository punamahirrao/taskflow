import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Detail } from "./Detail";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";

export function StorySprintField({ task }: Pick<SprintStoryDetailsDrawerProps, "task">) {
  const { t } = useTranslation();
  return (
    <Detail label={t("sprintTrain.sprint")}>
      {task.sprint_name || t("sprintTrain.notInSprint")}
    </Detail>
  );
}

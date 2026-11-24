import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Detail } from "./Detail";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";

export function StoryProjectField({
  task,
  projectName,
}: Pick<SprintStoryDetailsDrawerProps, "task" | "projectName">) {
  const { t } = useTranslation();
  return (
    <Detail label={t("app.project")}>
      {projectName ?? task.project_name ?? t("sprintTrain.projectNumber", { id: task.project })}
    </Detail>
  );
}

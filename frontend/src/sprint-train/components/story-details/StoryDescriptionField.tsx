import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Detail } from "./Detail";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import { EditableText } from "./EditableText";

export function StoryDescriptionField({
  task,
  onUpdate,
}: Pick<SprintStoryDetailsDrawerProps, "task" | "onUpdate">) {
  const { t } = useTranslation();
  return (
    <Detail label={t("sprintTrain.description")}>
      <EditableText
        value={task.description}
        onSave={(description) => onUpdate({ description })}
        placeholder={t("sprintTrain.addDescription")}
        multiline
      />
    </Detail>
  );
}

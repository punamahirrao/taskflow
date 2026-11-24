import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Detail } from "./Detail";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import { EditableText } from "./EditableText";

export function StoryTagsField({
  task,
  onUpdate,
}: Pick<SprintStoryDetailsDrawerProps, "task" | "onUpdate">) {
  const { t } = useTranslation();
  return (
    <Detail label={t("sprintTrain.tags")}>
      <EditableText
        value={task.tags.join(", ")}
        onSave={(tags) =>
          onUpdate({
            tags: tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          })
        }
        placeholder={t("sprintTrain.addTags")}
      />
    </Detail>
  );
}

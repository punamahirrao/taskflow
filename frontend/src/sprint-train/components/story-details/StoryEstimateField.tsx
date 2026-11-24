import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Detail } from "./Detail";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import { Clock3 } from "lucide-react";
import { EditableText } from "./EditableText";

export function StoryEstimateField({
  task,
  onUpdate,
}: Pick<SprintStoryDetailsDrawerProps, "task" | "onUpdate">) {
  const { t } = useTranslation();
  return (
    <Detail label={t("sprintTrain.estimate")}>
      <span className="inline-flex w-full items-center gap-1.5">
        <Clock3 size={14} className="shrink-0 text-slate-400" />
        <EditableText
          value={task.estimate}
          onSave={(estimate) => onUpdate({ estimate })}
          placeholder={t("sprintTrain.addEstimate")}
        />
      </span>
    </Detail>
  );
}

import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Detail } from "./Detail";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import { CalendarDays } from "lucide-react";
import { EditableText } from "./EditableText";

export function StoryDueDateField({
  task,
  onUpdate,
}: Pick<SprintStoryDetailsDrawerProps, "task" | "onUpdate">) {
  const { t } = useTranslation();
  return (
    <Detail label={t("sprintTrain.dueDate")}>
      <span className="inline-flex w-full items-center gap-1.5">
        <CalendarDays size={14} className="shrink-0 text-slate-400" />
        <EditableText
          type="date"
          value={task.due_date ?? ""}
          onSave={(due_date) => onUpdate({ due_date: due_date || null })}
          placeholder={t("sprintTrain.addDueDate")}
        />
      </span>
    </Detail>
  );
}

import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Detail } from "./Detail";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import { UserRound } from "lucide-react";

export function StoryAssigneeField({ task }: Pick<SprintStoryDetailsDrawerProps, "task">) {
  const { t } = useTranslation();
  return (
    <Detail label={t("sprintTrain.assignedTo")}>
      <span className="inline-flex items-center gap-2">
        {task.assignee_photo_url ? (
          <img src={task.assignee_photo_url} alt="" className="size-7 rounded-full object-cover" />
        ) : (
          <span className="grid size-7 place-items-center rounded-full bg-slate-100 text-slate-500">
            <UserRound size={15} />
          </span>
        )}
        {task.assignee_name || t("sprintTrain.unassigned")}
      </span>
    </Detail>
  );
}

import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import Avatar from "../../../common/components/Avatar";
import { UserRound } from "lucide-react";
import type { Task } from "../../../features/tasks/entities/task";

export function BacklogStoryAvatar({ task }: { task: Task }) {
  const { t } = useTranslation();
  return (
    <>
      {task.assignee != null ? (
        <Avatar
          name={task.assignee_name || t("sprintTrain.assignedTo")}
          photoUrl={task.assignee_photo_url}
          size={24}
        />
      ) : (
        <span
          className="sprint-unassigned-avatar"
          role="img"
          aria-label="Unassigned profile picture"
        >
          <UserRound size={15} />
        </span>
      )}
    </>
  );
}

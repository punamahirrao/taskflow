import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { Detail } from "./Detail";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import { Flag } from "lucide-react";

export function StoryDependenciesField({ task }: Pick<SprintStoryDetailsDrawerProps, "task">) {
  const { t } = useTranslation();
  return (
    <Detail label={t("sprintTrain.dependencies")}>
      <span className="inline-flex items-center gap-1.5">
        <Flag size={14} className="text-amber-600" />
        {task.blocked_by.map((id) => `NEX-${id}`).join(", ")}
      </span>
    </Detail>
  );
}

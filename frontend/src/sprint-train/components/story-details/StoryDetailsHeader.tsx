import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { AlertTriangle } from "lucide-react";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import { StoryDetailsTitle } from "./StoryDetailsTitle";
import { StoryStatusField } from "./StoryStatusField";
import { StoryPriorityField } from "./StoryPriorityField";

export function StoryDetailsHeader({
  task,
  onUpdate,
  onClose,
}: Pick<SprintStoryDetailsDrawerProps, "task" | "onUpdate" | "onClose">) {
  const { t } = useTranslation();
  return (
    <header className="border-b border-slate-200 bg-slate-50 p-5">
      <StoryDetailsTitle task={task} onUpdate={onUpdate} onClose={onClose} />
      <div className="mt-3 flex flex-wrap gap-2">
        <StoryStatusField task={task} onUpdate={onUpdate} />
        <StoryPriorityField task={task} onUpdate={onUpdate} />
        {task.blocked && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
            <AlertTriangle size={12} />
            {t("sprintTrain.blocked")}
          </span>
        )}
      </div>
    </header>
  );
}

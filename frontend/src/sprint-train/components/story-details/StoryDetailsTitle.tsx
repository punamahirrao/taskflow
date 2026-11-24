import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { X } from "lucide-react";
import type { SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import { EditableText } from "./EditableText";

export function StoryDetailsTitle({
  task,
  onUpdate,
  onClose,
}: Pick<SprintStoryDetailsDrawerProps, "task" | "onUpdate" | "onClose">) {
  const { t } = useTranslation();
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[calc(10px*var(--taskflow-font-scale,1))] font-bold uppercase tracking-widest text-indigo-600">
          NEX-{task.id} · {task.work_type.replace("_", " ")}
        </p>
        <div className="mt-1">
          <EditableText
            value={task.title}
            onSave={(title) => onUpdate({ title })}
            placeholder={t("sprintTrain.addTitle")}
          />
        </div>
      </div>
      <button
        type="button"
        aria-label={t("sprintTrain.closeStoryDetails")}
        onClick={onClose}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-200"
      >
        <X size={18} />
      </button>
    </div>
  );
}

import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { ReactNode } from "react";
import type { Task } from "../../../features/tasks/entities/task";
import { startStoryDrag } from "../shared/sprintDrag";

export function BacklogStoryFrame({
  task,
  selected,
  onSelectStory,
  children,
}: {
  task: Task;
  selected: boolean;
  onSelectStory: (id: number) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  return (
    <article
      draggable
      onDragStart={(event) => startStoryDrag(event, task.id)}
      onClick={() => onSelectStory(task.id)}
      aria-label={t("sprintTrain.openDetailsFor", { title: task.title })}
      className={`sprint-backlog-card cursor-pointer rounded-lg border p-3 transition hover:border-indigo-400 active:cursor-grabbing ${selected ? "border-indigo-500 ring-2 ring-indigo-200" : ""}`}
    >
      {children}
    </article>
  );
}

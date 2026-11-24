import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { Task } from "../../../features/tasks/entities/task";
import { SprintDependencyBadge } from "./SprintDependencyBadge";

export function SprintDependencyRow({ task, blockedBy }: { task: Task; blockedBy: Task[] }) {
  const { t } = useTranslation();
  return (
    <div className="grid gap-2 p-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center">
      <div>
        <p className="text-xs font-semibold text-indigo-600">
          NEX-{task.id} · {task.sprint_name ?? t("sprintTrain.sprint")}
        </p>
        <p className="mt-1 text-sm font-semibold">{task.title}</p>
      </div>
      <div className="hidden text-slate-400 md:block">←</div>
      <div className="flex flex-wrap gap-2">
        {blockedBy.map((dependency) => (
          <SprintDependencyBadge key={dependency.id} task={dependency} />
        ))}
      </div>
    </div>
  );
}

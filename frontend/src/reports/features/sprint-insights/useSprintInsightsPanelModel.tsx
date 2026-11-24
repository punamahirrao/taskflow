import { useMemo, useState } from "react";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { Sprint, Task } from "../../../features/tasks/entities/task";
import type { WorkloadMember } from "../../entities/reports";
interface SprintInsightsPanelProps {
  tasks: Task[];
  sprints: Sprint[];
}
function numericPoints(estimate: string) {
  const value = Number.parseFloat(estimate);
  return Number.isFinite(value) ? value : 1;
}

export function useSprintInsightsPanelModel({ tasks, sprints }: SprintInsightsPanelProps) {
  const { t } = useTranslation();
  const [now] = useState(() => Date.now());
  const active = sprints.filter((sprint) => sprint.is_active);
  const members = useMemo(() => {
    const counts = new Map<string, WorkloadMember>();
    tasks
      .filter((task) => task.status !== "done")
      .forEach((task) => {
        const key = task.assignee ? String(task.assignee) : "unassigned";
        const row = counts.get(key) ?? {
          name: task.assignee_name || t("reports.unassigned"),
          count: 0,
          points: 0,
        };
        row.count += 1;
        row.points += numericPoints(task.estimate);
        counts.set(key, row);
      });
    return [...counts.values()].sort((a, b) => b.points - a.points || b.count - a.count);
  }, [tasks, t]);

  return { t, now, active, members, tasks };
}

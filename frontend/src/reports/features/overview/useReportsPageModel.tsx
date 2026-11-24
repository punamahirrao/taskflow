import { useEffect, useMemo, useState } from "react";
import { useAgileProjectScope } from "../../../common/features/agile/hooks/useAgileProjectScope";
import { averageDays } from "../../../common/features/agile/utils/boardView";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { getSprints } from "../../../features/tasks/api/sprints";
import type { Sprint } from "../../../features/tasks/entities/task";
import { useAgileTasks } from "../../../features/tasks/hooks/useAgileTasks";
import type { StatusCount, StatusDefinition } from "../../entities/reports";

export function useReportsPageModel() {
  const { t } = useTranslation();
  const scope = useAgileProjectScope();
  const agile = useAgileTasks(scope.projectId);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    let live = true;
    void getSprints(scope.projectId)
      .then((result) => {
        if (live) setSprints(result);
      })
      .catch(() => {
        if (live) setSprints([]);
      });
    return () => {
      live = false;
    };
  }, [scope.projectId]);

  const completedRecently = agile.tasks.filter(
    (task) => task.completed_at && now - Date.parse(task.completed_at) <= 7 * 86400000,
  ).length;
  const cycleDays = averageDays(
    agile.tasks
      .filter((task) => task.started_at && task.completed_at)
      .map((task) => Date.parse(task.completed_at!) - Date.parse(task.started_at!)),
  );
  const leadDays = averageDays(
    agile.tasks
      .filter((task) => task.created_at && task.completed_at)
      .map((task) => Date.parse(task.completed_at!) - Date.parse(task.created_at!)),
  );
  const overdue = agile.tasks.filter(
    (task) =>
      task.status !== "done" &&
      task.due_date &&
      task.due_date < new Date(now).toISOString().slice(0, 10),
  ).length;
  const inProgress = agile.tasks.filter((task) => task.status === "in_progress").length;
  const blocked = agile.tasks.filter(
    (task) =>
      task.blocked ||
      task.blocked_by.some((id) =>
        agile.tasks.some((dependency) => dependency.id === id && dependency.status !== "done"),
      ),
  ).length;
  const statusCounts = useMemo(() => {
    const known: StatusDefinition[] = [
      { label: t("reports.statusBacklog"), key: "backlog", color: "bg-slate-400" },
      { label: t("reports.statusTodo"), key: "todo", color: "bg-indigo-400" },
      { label: t("reports.statusInProgress"), key: "in_progress", color: "bg-sky-500" },
      { label: t("reports.statusReview"), key: "review", color: "bg-amber-500" },
      { label: t("reports.statusWaiting"), key: "waiting", color: "bg-orange-500" },
      { label: t("reports.statusDone"), key: "done", color: "bg-emerald-500" },
    ];
    const extras = [...new Set(agile.tasks.map((task) => task.status))]
      .filter((status) => !known.some(({ key }) => key === status))
      .sort();
    const colors = ["bg-fuchsia-500", "bg-cyan-500", "bg-lime-500", "bg-rose-500"];
    return [
      ...known,
      ...extras.map((status, index): StatusDefinition => ({
        label: status.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
        key: status,
        color: colors[index % colors.length],
      })),
    ].map(({ label, key, color }): StatusCount => ({
      label,
      count: agile.tasks.filter((task) => task.status === key).length,
      color,
    }));
  }, [agile.tasks, t]);
  const totalTasks = agile.tasks.length;

  return {
    t,
    scope,
    agile,
    sprints,
    completedRecently,
    cycleDays,
    leadDays,
    overdue,
    inProgress,
    blocked,
    statusCounts,
    totalTasks,
  };
}

import type { Task } from "../../../../features/tasks/entities/task";
import { translate } from "../../../../common/shared/i18n/translate";
import type { BacklogGroup, ProjectOption } from "../../../entities/backlog";

export type BacklogGroupBy = "project" | "theme" | "parent";

export function priorityOrder(priority: Task["priority"]) {
  return { urgent: 0, high: 1, medium: 2, low: 3 }[priority];
}

export function getDefinitionOfReady(task: Task, tasks: Task[]) {
  const hasUnresolvedDependency =
    task.blocked ||
    task.blocked_by.some((id) =>
      tasks.some((dependency) => dependency.id === id && dependency.status !== "done"),
    );
  const checks = [
    Boolean(task.description.trim()),
    Boolean(task.estimate.trim()),
    task.assignee !== null,
    !hasUnresolvedDependency,
  ];
  return { ready: checks.filter(Boolean).length, total: checks.length, checks };
}

export function suggestedPriority(task: Task, now: number): Task["priority"] {
  let score = { urgent: 4, high: 3, medium: 2, low: 1 }[task.priority];
  if (task.due_date) {
    const daysUntilDue = (Date.parse(`${task.due_date}T00:00:00`) - now) / 86400000;
    if (daysUntilDue < 0) score += 2;
    else if (daysUntilDue <= 3) score += 1;
  }
  const updatedAt = Date.parse(task.updated_at ?? task.created_at ?? "");
  if (Number.isFinite(updatedAt) && now - updatedAt > 14 * 86400000) score += 1;
  if (task.ready_for_sprint) score += 0.5;
  return score >= 5 ? "urgent" : score >= 4 ? "high" : score >= 2 ? "medium" : "low";
}

export function suggestionReason(task: Task, now: number) {
  const reasons: string[] = [];
  if (task.due_date && Date.parse(`${task.due_date}T00:00:00`) < now)
    reasons.push(translate("backlog.reasonOverdue"));
  else if (task.due_date && Date.parse(`${task.due_date}T00:00:00`) - now < 4 * 86400000)
    reasons.push(translate("backlog.reasonDueSoon"));
  const updatedAt = Date.parse(task.updated_at ?? task.created_at ?? "");
  if (Number.isFinite(updatedAt) && now - updatedAt > 14 * 86400000)
    reasons.push(translate("backlog.reasonStale"));
  if (task.ready_for_sprint) reasons.push(translate("backlog.reasonReady"));
  return reasons.length ? reasons.join(", ") : translate("backlog.reasonDefault");
}

export function groupBacklogTasks(
  tasks: Task[],
  projects: ProjectOption[],
  groupBy: BacklogGroupBy,
) {
  const groups = new Map<string, BacklogGroup>();
  tasks.forEach((task) => {
    const name =
      groupBy === "project"
        ? (task.project_name ??
          projects.find((project) => project.id === task.project)?.name ??
          translate("backlog.projectFallback", { id: task.project }))
        : groupBy === "theme"
          ? (task.tags[0] ?? translate("backlog.untaggedTheme"))
          : (task.parent_title ?? translate("backlog.independentWork"));
    const key = groupBy === "project" ? `project-${task.project}` : `${groupBy}-${name}`;
    const group = groups.get(key) ?? { name, tasks: [] };
    group.tasks.push(task);
    groups.set(key, group);
  });
  return [...groups.entries()]
    .sort(([, a], [, b]) => a.name.localeCompare(b.name))
    .map(([key, group]) => [group.name, group.tasks, key] as const);
}

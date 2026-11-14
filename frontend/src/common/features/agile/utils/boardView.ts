import type { TranslationKey } from "../../../entities/language";
import type { BoardTaskGroup, Task, TaskPriority } from "../../../entities/task";
import type { Project } from "../../../entities/project";
import { translate } from "../../../shared/i18n/translate";

export const STAGE_ORDER = ["backlog", "todo", "in_progress", "review", "waiting", "done"];
export const STAGE_COLORS: Record<string, string> = { backlog: "bg-slate-400", todo: "bg-violet-500", in_progress: "bg-sky-500", review: "bg-amber-500", waiting: "bg-orange-500", done: "bg-emerald-500" };
export const PRIORITY_LABELS: Record<TaskPriority, TranslationKey> = { urgent: "agile.priorityUrgent", high: "agile.priorityHigh", medium: "agile.priorityMedium", low: "agile.priorityLow" };
export type Swimlane = "project" | "priority" | "assignee" | "epic" | "sprint_goal";

export function averageDays(durations: number[]) {
  if (!durations.length) return null;
  return Math.round((durations.reduce((total, value) => total + value, 0) / durations.length / 86400000) * 10) / 10;
}

export function groupBoardTasks(tasks: Task[], swimlane: Swimlane, projects: Pick<Project, "id" | "name">[]) {
  const groups = new Map<string, BoardTaskGroup>();
  tasks.forEach((task) => {
    const projectName = task.project_name ?? projects.find((project) => project.id === task.project)?.name ?? translate("agile.projectNumber", { id: task.project });
    const name = swimlane === "project" ? projectName
      : swimlane === "priority" ? translate(PRIORITY_LABELS[task.priority])
      : swimlane === "assignee" ? task.assignee_name || translate("agile.unassigned")
      : swimlane === "epic" ? task.parent_title || translate("agile.independentWork")
      : task.sprint_goal || translate("agile.noSprintGoal");
    const key = swimlane === "project" ? `project-${task.project}` : `${swimlane}-${name}`;
    const group = groups.get(key) ?? { name, tasks: [] };
    group.tasks.push(task);
    groups.set(key, group);
  });
  return [...groups.entries()].sort(([, first], [, second]) => first.name.localeCompare(second.name))
    .map(([key, group]) => [key, group.name, group.tasks] as const);
}

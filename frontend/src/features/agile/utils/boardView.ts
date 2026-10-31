import type { Task } from "../../../entities/task";

export const STAGE_ORDER = ["backlog", "todo", "in_progress", "review", "done"];
export const STAGE_COLORS: Record<string, string> = { backlog: "bg-slate-400", todo: "bg-violet-500", in_progress: "bg-sky-500", review: "bg-amber-500", done: "bg-emerald-500" };
export type Swimlane = "project" | "priority" | "assignee" | "epic" | "sprint_goal";

export function averageDays(durations: number[]) {
  if (!durations.length) return null;
  return Math.round((durations.reduce((total, value) => total + value, 0) / durations.length / 86400000) * 10) / 10;
}

export function groupBoardTasks(tasks: Task[], swimlane: Swimlane, projects: { id: number; name: string }[]) {
  const groups = new Map<string, { name: string; tasks: Task[] }>();
  tasks.forEach((task) => {
    const projectName = task.project_name ?? projects.find((project) => project.id === task.project)?.name ?? `Project ${task.project}`;
    const name = swimlane === "project" ? projectName
      : swimlane === "priority" ? task.priority[0].toUpperCase() + task.priority.slice(1)
      : swimlane === "assignee" ? task.assignee_name || "Unassigned"
      : swimlane === "epic" ? task.parent_title || "Independent work"
      : task.sprint_goal || "No sprint goal";
    const key = swimlane === "project" ? `project-${task.project}` : `${swimlane}-${name}`;
    const group = groups.get(key) ?? { name, tasks: [] };
    group.tasks.push(task);
    groups.set(key, group);
  });
  return [...groups.entries()].sort(([, first], [, second]) => first.name.localeCompare(second.name))
    .map(([key, group]) => [key, group.name, group.tasks] as const);
}

import type { Task } from "../../features/tasks/entities/task";

const DAY = 86400000;
export const FEATURE_TYPES = new Set(["epic", "initiative", "enhancement"]);
export function dayNumber(value?: string | null): number | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) ? Math.floor(time / DAY) : null;
}
export const isoDate = (day: number) => new Date(day * DAY).toISOString().slice(0, 10);
export function todayDate() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export const shortDate = (value?: string | null) =>
  dayNumber(value) === null
    ? "Not scheduled"
    : new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(
        new Date(`${value}T00:00:00Z`),
      );
export function monday(day: number) {
  return day - ((new Date(day * DAY).getUTCDay() + 6) % 7);
}
export function weekLabel(value?: string | null) {
  const day = dayNumber(value);
  if (day === null) return "Unscheduled";
  const thursday = monday(day) + 3;
  const year = new Date(thursday * DAY).getUTCFullYear();
  const first = monday(Math.floor(Date.UTC(year, 0, 4) / DAY));
  return `W${String(Math.floor((monday(day) - first) / 7) + 1).padStart(2, "0")} · ${year}`;
}
export const statusLabel = (status: string) =>
  ({
    backlog: "Not started",
    todo: "Planned",
    in_progress: "In progress",
    review: "In review",
    waiting: "Waiting",
    done: "Complete",
  })[status] ?? status.replaceAll("_", " ");

export interface RoadmapNode {
  task: Task;
  predecessors: number[];
  successors: number[];
  external: number[];
  duration: number | null;
  depth: number;
  early: number;
  late: number;
  slack: number;
  critical: boolean;
  x: number;
  y: number;
}
export interface RoadmapEdge {
  from: number;
  to: number;
  critical: boolean;
  conflict: boolean;
}
export interface RoadmapPlan {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
  width: number;
  height: number;
  hasCycle: boolean;
  completeSchedule: boolean;
  criticalDays: number | null;
  durationDays: number | null;
  startDate: string | null;
  endDate: string | null;
  completed: number;
  conflicts: number;
  externalCount: number;
}
export const NODE_WIDTH = 156;
export const NODE_HEIGHT = 86;

export function buildRoadmap(tasks: Task[]): RoadmapPlan {
  const byId = new Map<number, RoadmapNode>();
  for (const task of tasks) {
    const start = dayNumber(task.planned_start_date),
      end = dayNumber(task.due_date);
    byId.set(task.id, {
      task,
      predecessors: [],
      successors: [],
      external: [],
      duration: start !== null && end !== null && end >= start ? end - start + 1 : null,
      depth: 0,
      early: 0,
      late: 0,
      slack: 0,
      critical: false,
      x: 0,
      y: 0,
    });
  }
  for (const node of byId.values()) {
    node.predecessors = [...new Set(node.task.blocked_by)].filter((id) => byId.has(id));
    node.external = node.task.blocked_by.filter((id) => !byId.has(id));
    for (const id of node.predecessors) byId.get(id)!.successors.push(node.task.id);
  }
  const degrees = new Map([...byId].map(([id, node]) => [id, node.predecessors.length]));
  const queue = [...byId.values()]
    .filter((node) => !node.predecessors.length)
    .sort((a, b) => a.task.rank - b.task.rank || a.task.id - b.task.id);
  const ordered: RoadmapNode[] = [];
  for (let index = 0; index < queue.length; index++) {
    const node = queue[index];
    ordered.push(node);
    for (const id of node.successors) {
      const next = byId.get(id)!;
      next.depth = Math.max(next.depth, node.depth + 1);
      next.early = Math.max(next.early, node.early + (node.duration ?? 0));
      degrees.set(id, degrees.get(id)! - 1);
      if (degrees.get(id) === 0) queue.push(next);
    }
  }
  const hasCycle = ordered.length !== tasks.length;
  const processed = new Set(ordered.map((node) => node.task.id));
  const nodes = [...ordered, ...[...byId.values()].filter((node) => !processed.has(node.task.id))];
  const externalCount = nodes.reduce((sum, node) => sum + node.external.length, 0);
  const completeSchedule =
    nodes.length > 0 &&
    !hasCycle &&
    externalCount === 0 &&
    nodes.every((node) => node.duration !== null);
  const finish = Math.max(0, ...nodes.map((node) => node.early + (node.duration ?? 0)));
  if (!hasCycle)
    for (const node of [...ordered].reverse()) {
      const latestFinish = node.successors.length
        ? Math.min(...node.successors.map((id) => byId.get(id)!.late))
        : finish;
      node.late = latestFinish - (node.duration ?? 0);
      node.slack = Math.max(0, node.late - node.early);
      node.critical = completeSchedule && node.slack === 0;
    }
  const maxDepth = Math.max(0, ...nodes.map((node) => node.depth));
  const columns = Array.from({ length: maxDepth + 1 }, (_, depth) =>
    nodes.filter((node) => node.depth === depth),
  );
  const height = Math.max(330, Math.max(0, ...columns.map((column) => column.length)) * 120 + 70);
  columns.forEach((column, depth) =>
    column.forEach((node, row) => {
      node.x = 130 + depth * 190;
      node.y = ((row + 1) * height) / (column.length + 1) - NODE_HEIGHT / 2;
    }),
  );
  const edges = nodes.flatMap((node) =>
    node.predecessors.map((id): RoadmapEdge => {
      const previous = byId.get(id)!;
      const previousEnd = dayNumber(previous.task.due_date),
        nextStart = dayNumber(node.task.planned_start_date);
      return {
        from: id,
        to: node.task.id,
        critical:
          previous.critical &&
          node.critical &&
          previous.early + (previous.duration ?? 0) === node.early,
        conflict: previousEnd !== null && nextStart !== null && previousEnd >= nextStart,
      };
    }),
  );
  const starts = nodes
    .map((node) => dayNumber(node.task.planned_start_date))
    .filter((day): day is number => day !== null);
  const ends = nodes
    .map((node) => dayNumber(node.task.due_date))
    .filter((day): day is number => day !== null);
  const start = starts.length ? Math.min(...starts) : null,
    end = ends.length ? Math.max(...ends) : null;
  return {
    nodes,
    edges,
    width: maxDepth * 190 + 430,
    height,
    hasCycle,
    completeSchedule,
    criticalDays: completeSchedule ? finish : null,
    durationDays: start !== null && end !== null ? end - start + 1 : null,
    startDate: start === null ? null : isoDate(start),
    endDate: end === null ? null : isoDate(end),
    completed: nodes.filter((node) =>
      node.task.story_progress
        ? node.task.story_progress.total > 0 && node.task.story_progress.percent === 100
        : node.task.status === "done",
    ).length,
    conflicts: edges.filter((edge) => edge.conflict).length,
    externalCount,
  };
}

export { createsCycle } from "../../features/tasks/utils/dependencies.ts";

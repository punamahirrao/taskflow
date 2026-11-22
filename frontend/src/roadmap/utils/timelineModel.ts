import { dayNumber, isoDate, monday, shortDate, weekLabel } from "./roadmapModel.ts";
import type { Task } from "../../features/tasks/entities/task";

export type TimelineScale = "weekly" | "monthly" | "quarterly" | "yearly";
export type TimelineGesture = "move" | "start" | "end";
export const TIMELINE_SCALES: TimelineScale[] = ["weekly", "monthly", "quarterly", "yearly"];
export const DEFAULT_FEATURE_COLOR = "#7c3aed";
export const FEATURE_COLORS = [
  "#7c3aed",
  "#2563eb",
  "#0891b2",
  "#059669",
  "#d97706",
  "#db2777",
  "#dc2626",
  "#475569",
];
export const featureColor = (task: Task) =>
  /^#[\da-f]{6}$/i.test(task.roadmap_color ?? "") ? task.roadmap_color! : DEFAULT_FEATURE_COLOR;
export const ROADMAP_HEALTH = {
  complete: { label: "Complete", color: "#059669" },
  active: { label: "In progress", color: "#2563eb" },
  risk: { label: "At risk", color: "#d97706" },
  delayed: { label: "Delayed", color: "#e14c70" },
  planned: { label: "Planned", color: "#8b5cf6" },
} as const;
export function roadmapHealth(task: Task, today: string) {
  if (task.story_progress?.total && task.story_progress.percent === 100) return "complete";
  if (task.due_date && task.due_date < today) return "delayed";
  if (task.blocked) return "risk";
  if ((task.story_progress?.percent ?? 0) > 0 || ["in_progress", "review"].includes(task.status))
    return "active";
  return "planned";
}

export function storyProgress(stories: Pick<Task, "status">[]) {
  const total = stories.length,
    completed = stories.filter((story) => story.status === "done").length;
  return { total, completed, percent: total ? Math.round((completed / total) * 100) : 0 };
}
export function withStoryProgress(tasks: Task[]): Task[] {
  const byParent = new Map<number, Task[]>();
  for (const task of tasks)
    if (task.work_type === "story" && task.parent !== null) {
      const list = byParent.get(task.parent) ?? [];
      list.push(task);
      byParent.set(task.parent, list);
    }
  return tasks.map((task) => {
    const stories = byParent.get(task.id) ?? [];
    return {
      ...task,
      linked_stories: stories.map(({ id, title, status }) => ({ id, title, status })),
      story_progress: storyProgress(stories),
    };
  });
}
export function contrastText(hex: string) {
  const rgb = [1, 3, 5]
    .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2] > 0.179 ? "#142238" : "#ffffff";
}

export function periodIndex(scale: TimelineScale, day: number) {
  const date = new Date(day * 86400000);
  return scale === "weekly"
    ? Math.floor(monday(day) / 7)
    : scale === "monthly"
      ? date.getUTCFullYear() * 12 + date.getUTCMonth()
      : scale === "quarterly"
        ? date.getUTCFullYear() * 4 + Math.floor(date.getUTCMonth() / 3)
        : date.getUTCFullYear();
}
export function createTimeAxis(
  scale: TimelineScale,
  anchor: number,
  offset = 0,
  availableWidth?: number,
) {
  const date = new Date(anchor * 86400000);
  const count = scale === "weekly" ? 8 : scale === "monthly" ? 12 : scale === "quarterly" ? 4 : 5;
  const defaultWidth =
    scale === "weekly" ? 140 : scale === "monthly" ? 168 : scale === "quarterly" ? 300 : 360;
  const minimumWidth = scale === "weekly" ? 120 : scale === "monthly" ? 80 : 200;
  const cellWidth = availableWidth ? Math.max(minimumWidth, availableWidth / count) : defaultWidth;
  function boundary(index: number) {
    if (scale === "weekly") return monday(anchor) + (index + offset) * 7;
    return Math.floor(
      (scale === "monthly"
        ? Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + index + offset, 1)
        : scale === "quarterly"
          ? Date.UTC(
              date.getUTCFullYear(),
              Math.floor(date.getUTCMonth() / 3) * 3 + (index + offset) * 3,
              1,
            )
          : Date.UTC(date.getUTCFullYear() + index + offset, 0, 1)) / 86400000,
    );
  }
  const originIndex = periodIndex(scale, boundary(0));
  function position(day: number) {
    const index = periodIndex(scale, day) - originIndex;
    const start = boundary(index),
      end = boundary(index + 1);
    return (index + (day - start) / (end - start)) * cellWidth;
  }
  function continuousDayAt(position: number) {
    const index = Math.floor(position / cellWidth),
      fraction = position / cellWidth - index;
    return boundary(index) + fraction * (boundary(index + 1) - boundary(index));
  }
  const dayAt = (position: number) => Math.round(continuousDayAt(position));
  const periods = Array.from({ length: count }, (_, index) => {
    const start = boundary(index),
      end = boundary(index + 1),
      stamp = new Date(start * 86400000);
    return {
      start,
      end,
      label:
        scale === "weekly"
          ? weekLabel(isoDate(start)).split(" · ")[0]
          : scale === "monthly"
            ? stamp.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })
            : scale === "quarterly"
              ? `Q${Math.floor(stamp.getUTCMonth() / 3) + 1}`
              : String(stamp.getUTCFullYear()),
      subtitle:
        scale === "weekly"
          ? `${shortDate(isoDate(start))} – ${shortDate(isoDate(end - 1))}`
          : scale === "monthly"
            ? String(stamp.getUTCFullYear())
            : scale === "quarterly"
              ? `${stamp.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })} – ${new Date((end - 1) * 86400000).toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" })}`
              : "January – December",
    };
  });
  return {
    first: boundary(0),
    last: boundary(count),
    width: cellWidth * count,
    count,
    cellWidth,
    periods,
    position,
    dayAt,
    continuousDayAt,
  };
}

/** Fractional period offsets pan continuously across months and year boundaries. */
export function createPannableTimeAxis(
  scale: TimelineScale,
  anchor: number,
  offset = 0,
  availableWidth?: number,
) {
  const whole = Math.floor(offset),
    fraction = offset - whole;
  const base = createTimeAxis(scale, anchor, whole, availableWidth);
  const shift = fraction * base.cellWidth;
  const extra = createTimeAxis(scale, anchor, whole + base.count, availableWidth).periods[0];
  return {
    ...base,
    first: base.continuousDayAt(shift),
    last: base.continuousDayAt(base.width + shift),
    gridOffset: -shift,
    position: (day: number) => base.position(day) - shift,
    dayAt: (x: number) => base.dayAt(x + shift),
    periods: [...base.periods, extra].map((period, index) => ({
      ...period,
      left: index * base.cellWidth - shift,
    })),
  };
}

export function changeSchedule(start: number, end: number, kind: TimelineGesture, days: number) {
  if (kind === "move") return { start: start + days, end: end + days };
  return kind === "start"
    ? { start: Math.min(end, start + days), end }
    : { start, end: Math.max(start, end + days) };
}
export function scheduleValues(start: number, end: number) {
  return { planned_start_date: isoDate(start), due_date: isoDate(end) };
}
export function scheduled(task: Task) {
  return dayNumber(task.planned_start_date) !== null && dayNumber(task.due_date) !== null;
}

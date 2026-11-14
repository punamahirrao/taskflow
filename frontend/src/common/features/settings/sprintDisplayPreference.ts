export const SPRINTS_VISIBLE_KEY = "taskflow_sprints_visible";
export const DEFAULT_SPRINTS_VISIBLE = 3;
export const SPRINT_DISPLAY_OPTIONS = [3, 5, 10, 15] as const;

export function getSprintDisplayCount(): number {
  if (typeof window === "undefined") return DEFAULT_SPRINTS_VISIBLE;
  const value = Number(window.localStorage.getItem(SPRINTS_VISIBLE_KEY));
  return SPRINT_DISPLAY_OPTIONS.includes(value as (typeof SPRINT_DISPLAY_OPTIONS)[number])
    ? value
    : DEFAULT_SPRINTS_VISIBLE;
}

export function saveSprintDisplayCount(value: number): void {
  if (SPRINT_DISPLAY_OPTIONS.includes(value as (typeof SPRINT_DISPLAY_OPTIONS)[number])) {
    window.localStorage.setItem(SPRINTS_VISIBLE_KEY, String(value));
  }
}

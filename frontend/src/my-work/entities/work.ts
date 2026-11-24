export const workTabs = [
  "overview",
  "tasks",
  "approvals",
  "calendar",
  "time",
  "projects",
  "mentions",
  "documents",
] as const;
export type WorkTab = (typeof workTabs)[number];

export const workFilters = [
  "Open",
  "Due today",
  "Upcoming",
  "Overdue",
  "High priority",
  "In review",
  "Blocked",
  "Completed",
] as const;
export type WorkFilter = (typeof workFilters)[number];

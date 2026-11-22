import type { ReleaseState } from "../entities/release";

export const releaseLabels: Record<ReleaseState, string> = {
  planned: "Planned",
  in_progress: "In progress",
  changes_requested: "Changes requested",
  ready: "Ready to release",
  done: "Done",
};
export const stepLabels = {
  pending: "Pending",
  in_progress: "In review",
  changes_requested: "Changes requested",
  approved: "Approved",
};

export function formatDate(date: string | null) {
  return date
    ? new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No target date";
}

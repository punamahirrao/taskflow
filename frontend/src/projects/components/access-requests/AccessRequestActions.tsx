import type { ProjectAccessRequest } from "../../api/projects";

export function AccessRequestActions({
  item,
  busyId,
  onReview,
}: {
  item: ProjectAccessRequest;
  busyId: number | null;
  onReview: (item: ProjectAccessRequest, decision: "approved" | "declined") => Promise<void>;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={busyId !== null}
        onClick={() => void onReview(item, "declined")}
        aria-label={`Decline ${item.requester.name}'s request`}
      >
        Decline
      </button>
      <button
        type="button"
        className="text-accent"
        disabled={busyId !== null}
        onClick={() => void onReview(item, "approved")}
        aria-label={`Approve ${item.requester.name}'s request`}
      >
        {busyId === item.id ? "Saving…" : "Approve"}
      </button>
    </div>
  );
}

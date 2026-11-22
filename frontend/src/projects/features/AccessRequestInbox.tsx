import { useEffect, useState } from "react";
import Avatar from "../../common/components/Avatar";
import {
  getProjectAccessRequests,
  reviewProjectAccessRequest,
  type ProjectAccessRequest,
} from "../api/projects";

export function AccessRequestInbox({ onReviewed }: { onReviewed: () => Promise<void> }) {
  const [requests, setRequests] = useState<ProjectAccessRequest[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<number | null>(null);
  const [version, setVersion] = useState(0);
  const [visibleCount, setVisibleCount] = useState(3);
  useEffect(() => {
    let active = true;
    getProjectAccessRequests()
      .then((items) => {
        if (active) {
          setRequests(items);
          setError("");
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setError(cause instanceof Error ? cause.message : "Could not load access requests.");
      });
    return () => {
      active = false;
    };
  }, [version]);
  async function review(item: ProjectAccessRequest, decision: "approved" | "declined") {
    setBusy(item.id);
    setError("");
    try {
      await reviewProjectAccessRequest(item.id, decision);
      setRequests((current) => current.filter((request) => request.id !== item.id));
      await onReviewed();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not review this request.");
    } finally {
      setBusy(null);
    }
  }
  if (!requests.length && !error) return null;
  return (
    <section className="project-request-inbox" aria-labelledby="access-inbox-title">
      <h2 id="access-inbox-title">
        Access requests <span className="project-section-count">{requests.length}</span>
      </h2>
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}{" "}
          <button
            className="project-text-link"
            type="button"
            onClick={() => setVersion(version + 1)}
          >
            Retry
          </button>
        </p>
      )}
      {requests.slice(0, visibleCount).map((item) => (
        <div className="project-request-row" key={item.id}>
          <div>
            <div className="flex items-center gap-2">
              <Avatar name={item.requester.name} photoUrl={item.requester.photo_url} size={28} />
              <strong>{item.requester.name}</strong>
            </div>
            <p>
              {item.project_name} · {item.requested_role === "member" ? "Member" : "Viewer"} access
            </p>
            <p>{item.reason}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void review(item, "declined")}
              aria-label={`Decline ${item.requester.name}'s request`}
            >
              Decline
            </button>
            <button
              type="button"
              className="text-accent"
              disabled={busy !== null}
              onClick={() => void review(item, "approved")}
              aria-label={`Approve ${item.requester.name}'s request`}
            >
              {busy === item.id ? "Saving…" : "Approve"}
            </button>
          </div>
        </div>
      ))}
      {requests.length > visibleCount && (
        <div className="project-more">
          <button
            className="project-text-link"
            type="button"
            onClick={() => setVisibleCount(visibleCount + 3)}
          >
            More requests
          </button>
        </div>
      )}
    </section>
  );
}

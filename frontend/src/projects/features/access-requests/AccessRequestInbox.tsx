import { useEffect, useState } from "react";
import {
  getProjectAccessRequests,
  reviewProjectAccessRequest,
  type ProjectAccessRequest,
} from "../../api/projects";
import { AccessInboxPanel } from "../../components/access-requests/AccessInboxPanel";
import { AccessInboxHeader } from "../../components/access-requests/AccessInboxHeader";
import { AccessInboxError } from "../../components/access-requests/AccessInboxError";
import { AccessRequestRow } from "../../components/access-requests/AccessRequestRow";
import { AccessInboxMore } from "../../components/access-requests/AccessInboxMore";

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
  const visibleRequests = requests.slice(0, visibleCount);
  return (
    <AccessInboxPanel>
      <AccessInboxHeader count={requests.length} />
      {error && <AccessInboxError message={error} onRetry={() => setVersion(version + 1)} />}
      {visibleRequests.map((item) => (
        <AccessRequestRow key={item.id} item={item} busyId={busy} onReview={review} />
      ))}
      {requests.length > visibleCount && (
        <AccessInboxMore onMore={() => setVisibleCount(visibleCount + 3)} />
      )}
    </AccessInboxPanel>
  );
}

import { ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../common/store";
import { dataScope } from "../../common/api/queryApi";
import { useReleasesQuery } from "../../releases/api/releases";
import type { ApprovalState } from "../../releases/entities/release";

const labels: Record<ApprovalState, string> = {
  pending: "Pending",
  in_progress: "Needs your review",
  changes_requested: "Changes requested",
  approved: "Approved",
};

export function WorkApprovals({ full, onView }: { full?: boolean; onView?: () => void }) {
  const userId = useAppSelector((state) => String(state.session.user?.id ?? ""));
  const scope = { ...dataScope(), userId };
  const query = useReleasesQuery({ ...scope, mine: true }, { skip: !scope.userId });
  const items = (query.currentData?.items ?? []).flatMap((release) =>
    release.steps
      .filter((step) => String(step.approver_id) === scope.userId)
      .map((step) => ({ release, step })),
  );
  items.sort((a, b) => Number(b.step.can_decide) - Number(a.step.can_decide));
  return (
    <section className="my-work-panel">
      <header className="my-work-panel-heading">
        <h2>
          My Approvals <span>({items.filter(({ step }) => step.can_decide).length} to review)</span>
        </h2>
        {onView && (
          <button type="button" className="my-work-link" onClick={onView}>
            View all →
          </button>
        )}
      </header>
      {query.error ? (
        <p className="my-work-empty" role="alert">
          Could not load approvals.{" "}
          <button type="button" className="my-work-link" onClick={() => void query.refetch()}>
            Try again
          </button>
        </p>
      ) : query.isFetching && !query.currentData ? (
        <p className="my-work-empty" role="status">
          Loading approvals…
        </p>
      ) : items.length ? (
        <ul className="my-work-list">
          {items.slice(0, full ? items.length : 4).map(({ release, step }) => (
            <li key={step.id}>
              <span className="my-work-avatar">
                <ClipboardCheck size={17} />
              </span>
              <Link className="my-work-item-link" to={`/releases?release=${release.id}`}>
                {release.name}
                <small>{step.name}</small>
              </Link>
              <span className="my-work-muted">{labels[step.status]}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="my-work-empty">No release approvals assigned to you.</p>
      )}
    </section>
  );
}

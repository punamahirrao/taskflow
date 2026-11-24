import { ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import type { Release, ApprovalStep, ApprovalState } from "../../../releases/entities/release";
const labels: Record<ApprovalState, string> = {
  pending: "Pending",
  in_progress: "Needs your review",
  changes_requested: "Changes requested",
  approved: "Approved",
};

export function WorkApprovalItem({ release, step }: { release: Release; step: ApprovalStep }) {
  return (
    <li>
      <span className="my-work-avatar">
        <ClipboardCheck size={17} />
      </span>
      <Link className="my-work-item-link" to={`/releases?release=${release.id}`}>
        {release.name}
        <small>{step.name}</small>
      </Link>
      <span className="my-work-muted">{labels[step.status]}</span>
    </li>
  );
}

import { ArrowUpRight } from "lucide-react";

export function OrganizationProjectAction({
  name,
  hasAccess,
  pending,
  onOpen,
  onRequest,
}: {
  name: string;
  hasAccess: boolean;
  pending: boolean;
  onOpen: () => void;
  onRequest: () => void;
}) {
  if (hasAccess)
    return (
      <button type="button" className="project-text-link" onClick={onOpen}>
        Open project <ArrowUpRight size={14} />
      </button>
    );
  if (pending)
    return (
      <span className="project-request-pending" role="status">
        Request pending
      </span>
    );
  return (
    <button
      type="button"
      className="project-text-link"
      onClick={onRequest}
      aria-label={`Request access to ${name}`}
    >
      Request access <ArrowUpRight size={14} />
    </button>
  );
}

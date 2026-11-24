import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { AttentionItem, AttentionKind } from "../../entities/delivery";
import { shortDate } from "../../utils/deliveryFormat";

export function NeedsAttentionItem({ item, kind }: { item: AttentionItem; kind: AttentionKind }) {
  return (
    <li>
      <span className={`delivery-dot ${kind}`} aria-hidden="true" />
      <div>
        <strong>{item.title}</strong>
        <small>
          {item.project_name} · {item.assignee ?? "Unassigned"}
        </small>
      </div>
      <div className="delivery-list-meta">
        <span>{item.due_date ? shortDate(item.due_date) : "No due date"}</span>
        <small>{item.priority} priority</small>
      </div>
      <Link
        className="delivery-open"
        to={`/project/${item.project_id}`}
        aria-label={`Open project ${item.project_name} for ${item.title}`}
      >
        <ArrowUpRight size={16} />
      </Link>
    </li>
  );
}

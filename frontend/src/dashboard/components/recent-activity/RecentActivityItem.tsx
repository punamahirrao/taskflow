import { History } from "lucide-react";
import { Link } from "react-router-dom";
import type { ActivityItem } from "../../api/dashboardQueries";

export function RecentActivityItem({ item }: { item: ActivityItem }) {
  return (
    <li>
      <span className="delivery-activity-icon">
        <History size={16} />
      </span>
      <div>
        <strong>{item.actor}</strong> {item.action.replaceAll("_", " ")}{" "}
        <Link className="delivery-link" to={`/project/${item.project_id}`}>
          {item.title}
        </Link>
        <small>{item.project_name}</small>
      </div>
      <time className="delivery-list-meta" dateTime={item.created_at}>
        {new Date(item.created_at).toLocaleString(undefined, {
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </time>
    </li>
  );
}

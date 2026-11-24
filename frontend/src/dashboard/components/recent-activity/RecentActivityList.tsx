import type { ActivityItem } from "../../api/dashboardQueries";
import { RecentActivityItem } from "./RecentActivityItem";

export function RecentActivityList({ activity }: { activity: ActivityItem[] }) {
  return (
    <ul className="delivery-list delivery-activity-list" id="delivery-activity-list">
      {activity.map((item) => (
        <RecentActivityItem key={item.id} item={item} />
      ))}
    </ul>
  );
}

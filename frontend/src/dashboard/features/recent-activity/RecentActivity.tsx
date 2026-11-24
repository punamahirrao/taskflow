import { useState } from "react";
import { dataScope } from "../../../common/api/queryApi";
import { useActivityQuery } from "../../api/dashboardQueries";
import { RecentActivityEmptyState } from "../../components/recent-activity/RecentActivityEmptyState";
import { RecentActivityError } from "../../components/recent-activity/RecentActivityError";
import { RecentActivityFooter } from "../../components/recent-activity/RecentActivityFooter";
import { RecentActivityHeader } from "../../components/recent-activity/RecentActivityHeader";
import { RecentActivityList } from "../../components/recent-activity/RecentActivityList";
import { RecentActivityPanel } from "../../components/recent-activity/RecentActivityPanel";

const ACTIVITY_LIMIT = 5;

export function RecentActivity({ projectId }: { projectId: number | null }) {
  const {
    currentData: activity,
    error,
    isFetching,
    refetch,
  } = useActivityQuery({
    ...dataScope(projectId),
    currentProjects: projectId === null,
  });
  const [visibleCount, setVisibleCount] = useState(ACTIVITY_LIMIT);
  const visibleActivity = activity?.slice(0, visibleCount) ?? [];
  const hasMore = visibleCount < (activity?.length ?? 0);

  function toggleMore() {
    setVisibleCount(hasMore ? visibleCount + ACTIVITY_LIMIT : ACTIVITY_LIMIT);
  }

  return (
    <RecentActivityPanel>
      <RecentActivityHeader />
      {error ? (
        <RecentActivityError onRetry={refetch} />
      ) : visibleActivity.length ? (
        <RecentActivityList activity={visibleActivity} />
      ) : (
        <RecentActivityEmptyState isFetching={isFetching} />
      )}
      {!error && activity && activity.length > ACTIVITY_LIMIT && (
        <RecentActivityFooter
          visibleCount={visibleActivity.length}
          totalCount={activity.length}
          hasMore={hasMore}
          onToggleMore={toggleMore}
        />
      )}
    </RecentActivityPanel>
  );
}

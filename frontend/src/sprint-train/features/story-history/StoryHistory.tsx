import type { TaskHistoryEntry } from "../../../features/tasks/entities/taskActivity";
import { StoryHistoryLayout } from "../../components/story-history/StoryHistoryLayout";
import { StoryHistoryLoading } from "../../components/story-history/StoryHistoryLoading";
import { StoryHistoryEmptyState } from "../../components/story-history/StoryHistoryEmptyState";
import { StoryHistoryList } from "../../components/story-history/StoryHistoryList";
import { StoryHistoryEntry } from "../../components/story-history/StoryHistoryEntry";
export function StoryHistory({
  history,
  loading,
}: {
  history: TaskHistoryEntry[];
  loading: boolean;
}) {
  return (
    <StoryHistoryLayout>
      {loading && <StoryHistoryLoading />}
      {!loading && !history.length && <StoryHistoryEmptyState />}
      <StoryHistoryList>
        {history.map((entry) => (
          <StoryHistoryEntry key={entry.id} entry={entry} />
        ))}
      </StoryHistoryList>
    </StoryHistoryLayout>
  );
}

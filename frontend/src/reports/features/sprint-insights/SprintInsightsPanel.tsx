import { SprintInsightsPanelView } from "../../components/sprint-insights/SprintInsightsPanelView";
import { useSprintInsightsPanelModel } from "./useSprintInsightsPanelModel";
export function SprintInsightsPanel({
  tasks,
  sprints,
}: Parameters<typeof useSprintInsightsPanelModel>[0]) {
  const model = useSprintInsightsPanelModel({ tasks, sprints });
  return <SprintInsightsPanelView model={model} />;
}

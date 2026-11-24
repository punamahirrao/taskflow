import { SprintProgressChartsView } from "../../components/sprint-progress/SprintProgressChartsView";
import { useSprintProgressChartsModel } from "./useSprintProgressChartsModel";
export function SprintProgressCharts({
  tasks,
  sprints,
}: Parameters<typeof useSprintProgressChartsModel>[0]) {
  const model = useSprintProgressChartsModel({ tasks, sprints });
  return <SprintProgressChartsView model={model} />;
}

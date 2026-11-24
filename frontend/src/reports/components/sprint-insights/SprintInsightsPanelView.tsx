import type { useSprintInsightsPanelModel } from "../../features/sprint-insights/useSprintInsightsPanelModel";
import { SprintHealthPanel } from "./SprintHealthPanel";
import { SprintWorkloadPanel } from "./SprintWorkloadPanel";
export function SprintInsightsPanelView({
  model,
}: {
  model: ReturnType<typeof useSprintInsightsPanelModel>;
}) {
  return (
    <section className="mb-5 grid gap-4 xl:grid-cols-2">
      <SprintWorkloadPanel model={model} />
      <SprintHealthPanel model={model} />
    </section>
  );
}

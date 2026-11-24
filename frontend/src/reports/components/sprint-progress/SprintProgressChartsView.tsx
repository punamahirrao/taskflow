import type { useSprintProgressChartsModel } from "../../features/sprint-progress/useSprintProgressChartsModel";
import { SprintCapacityChart } from "./SprintCapacityChart";
import { SprintVelocityChart } from "./SprintVelocityChart";

export function SprintProgressChartsView({
  model,
}: {
  model: ReturnType<typeof useSprintProgressChartsModel>;
}) {
  const { t } = model;
  return (
    <section className="mt-5 grid gap-4 xl:grid-cols-2" aria-label={t("reports.sprintChartsAria")}>
      <SprintCapacityChart model={model} />

      <SprintVelocityChart model={model} />
    </section>
  );
}

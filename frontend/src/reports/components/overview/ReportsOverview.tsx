import { SprintInsightsPanel } from "../../features/sprint-insights/SprintInsightsPanel";
import { SprintProgressCharts } from "../../features/sprint-progress/SprintProgressCharts";
import { ReportsDeliveryMetrics } from "./ReportsDeliveryMetrics";
import { ReportsHeader } from "./ReportsHeader";
import { ReportsStatusDistribution } from "./ReportsStatusDistribution";

import type { useReportsPageModel } from "../../features/overview/useReportsPageModel";
export function ReportsOverview({ model }: { model: ReturnType<typeof useReportsPageModel> }) {
  const { t, agile, sprints } = model;
  return (
    <div className="mx-auto max-w-[1440px]">
      <ReportsHeader model={model} />
      {agile.error && (
        <p role="alert" className="mb-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {agile.error}
        </p>
      )}
      <ReportsDeliveryMetrics model={model} />

      <ReportsStatusDistribution model={model} />

      <SprintProgressCharts tasks={agile.tasks} sprints={sprints} />
      <div className="mt-5">
        <SprintInsightsPanel tasks={agile.tasks} sprints={sprints} />
      </div>
      {agile.loading && (
        <p role="status" className="mt-4 text-xs text-slate-400">
          {t("reports.updating")}
        </p>
      )}
    </div>
  );
}

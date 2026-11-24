import { Activity, AlertTriangle, CheckCheck, Clock3, Gauge } from "lucide-react";
import type { useReportsPageModel } from "../../features/overview/useReportsPageModel";
import { BoardMetric } from "../delivery-metrics/BoardMetric";

export function ReportsDeliveryMetrics({
  model,
}: {
  model: ReturnType<typeof useReportsPageModel>;
}) {
  const { t, completedRecently, cycleDays, leadDays, overdue, inProgress, blocked } = model;
  return (
    <section
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      aria-label={t("reports.metricsAria")}
    >
      <BoardMetric
        label={t("reports.completedLabel")}
        value={completedRecently}
        note={t("reports.completedNote")}
        icon={<CheckCheck size={16} />}
        tint="green"
      />
      <BoardMetric
        label={t("reports.cycleTimeLabel")}
        value={
          cycleDays === null ? t("reports.noValue") : t("reports.daysValue", { count: cycleDays })
        }
        note={t("reports.cycleTimeNote")}
        icon={<Clock3 size={16} />}
      />
      <BoardMetric
        label={t("reports.leadTimeLabel")}
        value={
          leadDays === null ? t("reports.noValue") : t("reports.daysValue", { count: leadDays })
        }
        note={t("reports.leadTimeNote")}
        icon={<Activity size={16} />}
        tint="blue"
      />
      <BoardMetric
        label={t("reports.inProgressLabel")}
        value={inProgress}
        note={t("reports.inProgressNote")}
        icon={<Gauge size={16} />}
        tint="blue"
      />
      <BoardMetric
        label={t("reports.overdueBlockedLabel")}
        value={`${overdue} / ${blocked}`}
        note={t("reports.overdueBlockedNote")}
        icon={<AlertTriangle size={16} />}
        tint={overdue || blocked ? "rose" : "green"}
      />
    </section>
  );
}

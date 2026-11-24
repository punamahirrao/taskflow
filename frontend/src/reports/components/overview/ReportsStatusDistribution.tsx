import type { useReportsPageModel } from "../../features/overview/useReportsPageModel";

export function ReportsStatusDistribution({
  model,
}: {
  model: ReturnType<typeof useReportsPageModel>;
}) {
  const { t, scope, statusCounts, totalTasks } = model;
  return (
    <section
      className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      aria-label={t("reports.workByStatus")}
    >
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{t("reports.workByStatus")}</h2>
          <p className="mt-1 text-xs text-slate-500">
            {scope.projectId
              ? t("reports.distributionSelected")
              : t("reports.distributionAccessible")}
          </p>
        </div>
        <span className="text-xs font-medium text-slate-500">
          {t("reports.itemsCount", { count: totalTasks })}
        </span>
      </div>
      <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-slate-100">
        {statusCounts.map(
          (status) =>
            status.count > 0 && (
              <span
                key={status.label}
                className={status.color}
                style={{ width: `${(status.count / Math.max(totalTasks, 1)) * 100}%` }}
                title={t("reports.statusCountTitle", {
                  label: status.label,
                  count: status.count,
                })}
              />
            ),
        )}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {statusCounts.map((status) => (
          <div
            key={status.label}
            className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2"
          >
            <i className={`h-2.5 w-2.5 rounded-full ${status.color}`} />
            <span className="text-xs text-slate-600">{status.label}</span>
            <span className="ml-auto text-xs font-bold text-slate-800">{status.count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

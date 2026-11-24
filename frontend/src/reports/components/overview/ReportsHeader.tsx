import type { useReportsPageModel } from "../../features/overview/useReportsPageModel";

export function ReportsHeader({ model }: { model: ReturnType<typeof useReportsPageModel> }) {
  const { t } = model;
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">
          {t("reports.eyebrow")}
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {t("reports.title")}
        </h2>
        <p className="mt-2 text-sm text-slate-500">{t("reports.subtitle")}</p>
      </div>
    </header>
  );
}

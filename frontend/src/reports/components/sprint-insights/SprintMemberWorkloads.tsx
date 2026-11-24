import type { useSprintInsightsPanelModel } from "../../features/sprint-insights/useSprintInsightsPanelModel";
export function SprintMemberWorkloads({
  model,
}: {
  model: ReturnType<typeof useSprintInsightsPanelModel>;
}) {
  const { t, members } = model;
  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {members.length ? (
        members.map((member) => {
          const level =
            member.points >= 16 || member.count >= 7
              ? "high"
              : member.points >= 8 || member.count >= 4
                ? "medium"
                : "low";
          const style =
            level === "high"
              ? "border-rose-200 bg-rose-50 text-rose-800"
              : level === "medium"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800";
          return (
            <div
              key={member.name}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 ${style}`}
            >
              <span className="truncate text-xs font-medium">{member.name}</span>
              <span className="ml-2 shrink-0 text-[calc(10px*var(--taskflow-font-scale,1))]">
                {t("reports.memberLoad", { count: member.count, points: member.points })}
              </span>
            </div>
          );
        })
      ) : (
        <p className="text-xs text-slate-400">{t("reports.noActiveWork")}</p>
      )}
    </div>
  );
}

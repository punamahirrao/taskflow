import type { ReactNode } from "react";

export interface BoardMetricProps {
  label: string;
  value: string | number;
  note: string;
  icon: ReactNode;
  tint?: string;
}

export function BoardMetric({ label, value, note, icon, tint = "violet" }: BoardMetricProps) {
  const colors: Record<string, string> = {
    violet: "bg-violet-50 text-violet-700",
    blue: "bg-sky-50 text-sky-700",
    green: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-500">{label}</span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${colors[tint]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-1 text-[calc(11px*var(--taskflow-font-scale,1))] text-slate-400">{note}</p>
    </div>
  );
}

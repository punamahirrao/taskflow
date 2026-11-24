import type { ReactNode } from "react";

export function CapacityMetricCard({
  label,
  value,
  caption,
  strongClassName,
}: {
  label: string;
  value: ReactNode;
  caption: ReactNode;
  strongClassName?: string;
}) {
  return (
    <div className="capacity-metric">
      <span className="capacity-muted">{label}</span>
      <strong className={strongClassName}>{value}</strong>
      <span className="capacity-muted">{caption}</span>
    </div>
  );
}

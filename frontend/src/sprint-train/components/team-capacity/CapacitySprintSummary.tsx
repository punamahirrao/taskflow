import type { ReactNode } from "react";

export function CapacitySprintSummary({
  name,
  canManage,
  canForecast,
  workingDays,
  holidayDays,
  timeOffMembers,
  onForecast,
  children,
}: {
  name: string;
  canManage: boolean;
  canForecast: boolean;
  workingDays: number;
  holidayDays: number;
  timeOffMembers: number;
  onForecast: () => void;
  children: ReactNode;
}) {
  return (
    <div className="capacity-panel">
      <div className="capacity-panel-header">
        <div>
          <h3>{name}</h3>
          {children}
        </div>
        {canManage && (
          <button className="capacity-primary" disabled={!canForecast} onClick={onForecast}>
            Use forecast for sprint
          </button>
        )}
      </div>
      <p className="capacity-muted" style={{ marginTop: ".65rem" }}>
        {workingDays} weekdays · {holidayDays} holiday days · {timeOffMembers} members with time
        off. Weekends are excluded.
      </p>
    </div>
  );
}

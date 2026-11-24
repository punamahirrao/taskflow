import { duration } from "../../utils/workTime";
import { workTimeColors } from "./workTimeColors";
export function WorkTimeRing({ totals, total }: { totals: number[]; total: number }) {
  let cursor = 0;
  const segments = totals.map((minutes, index) => {
    const from = cursor;
    cursor += total ? (minutes / total) * 100 : 0;
    return `${workTimeColors[index]} ${from}% ${cursor}%`;
  });
  return (
    <div
      className="my-work-time-ring"
      style={{ background: total ? `conic-gradient(${segments.join(", ")})` : undefined }}
      aria-label={`${duration(total)} logged this week`}
    >
      <div>
        <strong>{duration(total)}</strong>
        <small>logged</small>
      </div>
    </div>
  );
}

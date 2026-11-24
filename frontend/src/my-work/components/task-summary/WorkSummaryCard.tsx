import { CalendarDays, ClipboardCheck, ListTodo, ShieldAlert, TriangleAlert } from "lucide-react";
import type { WorkFilter } from "../../entities/work";
const presentation = {
  Open: { label: "Open assignments", Icon: ListTodo, tone: "violet" },
  "Due today": { label: "Due today", Icon: CalendarDays, tone: "blue" },
  Overdue: { label: "Overdue", Icon: TriangleAlert, tone: "rose" },
  "In review": { label: "In review", Icon: ClipboardCheck, tone: "teal" },
  Blocked: { label: "Blocked", Icon: ShieldAlert, tone: "amber" },
};
export type WorkSummaryFilter = keyof typeof presentation;
export function WorkSummaryCard({
  filter,
  count,
  active,
  onSelect,
}: {
  filter: WorkSummaryFilter;
  count: number | string;
  active: boolean;
  onSelect: (filter: WorkFilter) => void;
}) {
  const { label, Icon, tone } = presentation[filter];
  return (
    <button
      type="button"
      className={`my-work-metric ${tone}`}
      aria-pressed={active}
      onClick={() => onSelect(filter)}
    >
      <span className="my-work-metric-icon">
        <Icon size={23} />
      </span>
      <span>
        <strong>{count}</strong>
        <small>{label}</small>
      </span>
    </button>
  );
}

import type { Task } from "../../../features/tasks/entities/task";
import {
  WorkSummaryCard,
  type WorkSummaryFilter,
} from "../../components/task-summary/WorkSummaryCard";
import { WorkSummaryGrid } from "../../components/task-summary/WorkSummaryGrid";
import type { WorkFilter } from "../../entities/work";
const metrics: WorkSummaryFilter[] = ["Open", "Due today", "Overdue", "In review", "Blocked"];
export function WorkTaskSummary({
  grouped,
  filter,
  unavailable,
  onSelect,
}: {
  grouped: Record<WorkFilter, Task[]>;
  filter: WorkFilter;
  unavailable: boolean;
  onSelect: (filter: WorkFilter) => void;
}) {
  return (
    <WorkSummaryGrid>
      {metrics.map((item) => (
        <WorkSummaryCard
          key={item}
          filter={item}
          count={unavailable ? "–" : grouped[item].length}
          active={filter === item}
          onSelect={onSelect}
        />
      ))}
    </WorkSummaryGrid>
  );
}

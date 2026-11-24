import type { Task } from "../../../features/tasks/entities/task";
import { workFilters, type WorkFilter } from "../../entities/work";
import { WorkTaskFilterButton } from "./WorkTaskFilterButton";
export function WorkTaskFilters({
  grouped,
  filter,
  onSelect,
}: {
  grouped: Record<WorkFilter, Task[]>;
  filter: WorkFilter;
  onSelect: (filter: WorkFilter) => void;
}) {
  return (
    <div className="my-work-filters" aria-label="Task filters">
      {workFilters.map((item) => (
        <WorkTaskFilterButton
          key={item}
          filter={item}
          active={filter === item}
          count={grouped[item].length}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

import type { WorkFilter } from "../../entities/work";
export function WorkTaskFilterButton({
  filter,
  active,
  count,
  onSelect,
}: {
  filter: WorkFilter;
  active: boolean;
  count: number;
  onSelect: (filter: WorkFilter) => void;
}) {
  return (
    <button type="button" aria-pressed={active} onClick={() => onSelect(filter)}>
      {filter} <span>{count}</span>
    </button>
  );
}

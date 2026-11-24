export function CapacityLogMore({
  count,
  expanded,
  onToggle,
}: {
  count: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  return <button onClick={onToggle}>{expanded ? "Show less" : `Show all ${count}`}</button>;
}

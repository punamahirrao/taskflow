import type { AttentionKind } from "../../entities/delivery";
import type { AttentionFilterOption } from "../../entities/deliveryAttention";

export function AttentionFilterButton({
  filter,
  active,
  onSelect,
}: {
  filter: AttentionFilterOption;
  active: boolean;
  onSelect: (id: AttentionKind) => void;
}) {
  return (
    <button type="button" aria-pressed={active} onClick={() => onSelect(filter.id)}>
      {filter.label} <b>{filter.count}</b>
    </button>
  );
}

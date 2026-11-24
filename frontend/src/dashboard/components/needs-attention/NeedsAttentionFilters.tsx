import type { AttentionKind } from "../../entities/delivery";
import type { AttentionFilterOption } from "../../entities/deliveryAttention";
import { AttentionFilterButton } from "./AttentionFilterButton";

export function NeedsAttentionFilters({
  filters,
  active,
  onSelect,
}: {
  filters: AttentionFilterOption[];
  active: AttentionKind;
  onSelect: (id: AttentionKind) => void;
}) {
  return (
    <div className="delivery-filters" aria-label="Attention filters">
      {filters.map((filter) => (
        <AttentionFilterButton
          key={filter.id}
          filter={filter}
          active={active === filter.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

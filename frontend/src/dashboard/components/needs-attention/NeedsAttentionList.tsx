import type { AttentionItem, AttentionKind } from "../../entities/delivery";
import { NeedsAttentionEmptyState } from "./NeedsAttentionEmptyState";
import { NeedsAttentionItem } from "./NeedsAttentionItem";

export function NeedsAttentionList({
  items,
  kind,
  emptyMessage,
}: {
  items: AttentionItem[];
  kind: AttentionKind;
  emptyMessage?: string;
}) {
  if (!items.length) return <NeedsAttentionEmptyState message={emptyMessage} />;
  return (
    <ul className="delivery-list" id="delivery-attention-list">
      {items.map((item) => (
        <NeedsAttentionItem key={item.id} item={item} kind={kind} />
      ))}
    </ul>
  );
}

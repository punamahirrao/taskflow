import { useState } from "react";
import { NeedsAttentionFilters } from "../../components/needs-attention/NeedsAttentionFilters";
import { NeedsAttentionFooter } from "../../components/needs-attention/NeedsAttentionFooter";
import { NeedsAttentionHeader } from "../../components/needs-attention/NeedsAttentionHeader";
import { NeedsAttentionList } from "../../components/needs-attention/NeedsAttentionList";
import { NeedsAttentionPanel } from "../../components/needs-attention/NeedsAttentionPanel";
import type { AttentionKind, DeliverySnapshot } from "../../entities/delivery";

const ATTENTION_LIMIT = 4;

const attentionFilters: { id: AttentionKind; label: string; empty: string }[] = [
  { id: "overdue", label: "Overdue", empty: "No open items are overdue." },
  {
    id: "blocked",
    label: "Blocked",
    empty: "No open items are marked blocked or waiting on an unfinished dependency you can see.",
  },
  {
    id: "due_soon",
    label: "Due in 7 days",
    empty: "No open work items are due in the next 7 days.",
  },
];

export function NeedsAttention({ snapshot }: { snapshot: DeliverySnapshot }) {
  const initial = attentionFilters.find(({ id }) => snapshot.attention[id].length)?.id ?? "overdue";
  const [filter, setFilter] = useState<AttentionKind | null>(null);
  const [visibleCount, setVisibleCount] = useState(ATTENTION_LIMIT);
  const active = filter ?? initial;
  const items = snapshot.attention[active];
  const count = snapshot.projects.reduce((sum, project) => sum + project[active], 0);
  const visibleItems = items.slice(0, visibleCount);
  const filters = attentionFilters.map(({ id, label }) => ({
    id,
    label,
    count: snapshot.projects.reduce((sum, project) => sum + project[id], 0),
  }));

  function selectFilter(id: AttentionKind) {
    setFilter(id);
    setVisibleCount(ATTENTION_LIMIT);
  }

  return (
    <NeedsAttentionPanel>
      <NeedsAttentionHeader />
      <NeedsAttentionFilters filters={filters} active={active} onSelect={selectFilter} />
      <NeedsAttentionList
        items={visibleItems}
        kind={active}
        emptyMessage={attentionFilters.find(({ id }) => id === active)?.empty}
      />
      {count > ATTENTION_LIMIT && (
        <NeedsAttentionFooter
          visibleCount={visibleItems.length}
          totalCount={count}
          hasMore={visibleCount < items.length}
          hasAdditional={count > items.length}
          projectId={snapshot.projects.length === 1 ? snapshot.projects[0].id : null}
          onMore={() => setVisibleCount(visibleCount + ATTENTION_LIMIT)}
          onShowLess={() => setVisibleCount(ATTENTION_LIMIT)}
        />
      )}
    </NeedsAttentionPanel>
  );
}

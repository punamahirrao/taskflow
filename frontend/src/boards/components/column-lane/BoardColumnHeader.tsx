const STAGE_TONES: Record<string, string> = {
  backlog: "bg-muted",
  todo: "bg-accent",
  in_progress: "bg-info",
  review: "bg-warning",
  waiting: "bg-warning",
  done: "bg-positive",
};

export function BoardColumnHeader({
  name,
  stage,
  count,
  limitLabel,
  overLimit,
}: {
  name: string;
  stage: string;
  count: number;
  limitLabel: string;
  overLimit: boolean;
}) {
  return (
    <header className="mb-2 flex items-center gap-2 px-1 py-1">
      <span className={`h-2 w-2 rounded-full ${STAGE_TONES[stage] ?? "bg-accent"}`} />
      <h3 className="text-xs font-bold uppercase tracking-wide text-content">{name}</h3>
      <span
        className={`ml-auto rounded-full px-2 py-0.5 text-[calc(10px*var(--taskflow-font-scale,1))] font-bold ${overLimit ? "bg-danger-soft text-danger" : "bg-surface text-muted"}`}
      >
        {count}
        {limitLabel}
      </span>
    </header>
  );
}

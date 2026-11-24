export function BacklogGroupHeader({ name, count }: { name: string; count: number }) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span className="h-2 w-2 rounded-full bg-violet-500" />
      <h4 className="text-sm font-semibold text-slate-800">{name}</h4>
      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[calc(10px*var(--taskflow-font-scale,1))] text-slate-500">
        {count}
      </span>
    </div>
  );
}

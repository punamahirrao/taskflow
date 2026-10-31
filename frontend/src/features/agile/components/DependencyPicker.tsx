import type { Task } from "../../../entities/task";

export function DependencyPicker({ task, candidates, compact = false, onChange }: {
  task: Task; candidates: Task[]; compact?: boolean; onChange: (ids: number[]) => void;
}) {
  const dependencies = task.blocked_by ?? [];
  const items = candidates.filter((item) => item.project === task.project && item.id !== task.id);
  return <details className="relative">
    <summary className="cursor-pointer list-none rounded-lg px-2 py-1 text-[10px] font-medium text-slate-500 hover:bg-slate-100">Depends on · {dependencies.length}</summary>
    <div className={`absolute right-0 z-20 mt-1 max-h-52 overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl ${compact ? "w-56" : "w-64"}`}>
      {items.length ? items.map((item) => <label key={item.id} className="flex cursor-pointer items-start gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50">
        <input type="checkbox" checked={dependencies.includes(item.id)} onChange={(event) => onChange(event.target.checked ? [...dependencies, item.id] : dependencies.filter((id) => id !== item.id))} className="mt-0.5 accent-violet-600" />
        <span className="min-w-0"><span className="block truncate font-medium text-slate-700">{item.title}</span><span className="text-[10px] text-slate-400">{item.status.replaceAll("_", " ")}</span></span>
      </label>) : <p className="px-2 py-3 text-xs text-slate-400">No other work items in this project.</p>}
    </div>
  </details>;
}

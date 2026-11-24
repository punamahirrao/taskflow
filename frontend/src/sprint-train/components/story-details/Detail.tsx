interface DetailProps {
  label: string;
  children: React.ReactNode;
}

export function Detail({ label, children }: DetailProps) {
  return (
    <div className="border-b border-slate-100 py-3">
      <dt className="text-[calc(10px*var(--taskflow-font-scale,1))] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm text-slate-700">{children}</dd>
    </div>
  );
}

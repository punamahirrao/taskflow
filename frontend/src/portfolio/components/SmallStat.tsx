interface SmallStatProps {
  label: string;
  value: number;
}

export default function SmallStat({ label, value }: SmallStatProps) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <p className="text-lg font-bold text-slate-800">{value}</p>
      <p className="text-[10px] text-slate-400">{label}</p>
    </div>
  );
}

import { Card, PageShell } from "../shared/components/MockupLayout";

const events: Record<number, { label: string; style: string }[]> = {
  3: [{ label: "Sprint planning", style: "bg-purple-100 text-purple-700" }],
  8: [{ label: "Design review", style: "bg-pink-100 text-pink-700" }],
  12: [{ label: "API deadline", style: "bg-red-100 text-red-700" }],
  15: [{ label: "Team sync", style: "bg-blue-100 text-blue-700" }, { label: "Demo", style: "bg-green-100 text-green-700" }],
  22: [{ label: "Release v1.2", style: "bg-amber-100 text-amber-700" }],
  27: [{ label: "Retrospective", style: "bg-purple-100 text-purple-700" }],
};
const upcoming = [["Oct 28", "Design review"], ["Oct 30", "Team sync"], ["Nov 2", "Release v1.2"]];
const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CalendarPage() {
  // October 2026 starts on a Thursday, so three blank cells precede day 1.
  const cells = [...Array<null>(3).fill(null), ...Array.from({ length: 31 }, (_, i) => i + 1)];
  return <PageShell subtitle="Deadlines and meetings at a glance.">
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
      <Card title="October 2026">
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 text-xs">
          {dayNames.map((d) => <div key={d} className="bg-slate-50 p-2 text-center font-medium text-slate-500">{d}</div>)}
          {cells.map((day, i) => <div key={i} className="min-h-20 bg-white p-1.5">
            {day && <><span className="text-slate-600">{day}</span>{events[day]?.map((e) => <p key={e.label} className={`mt-1 truncate rounded px-1.5 py-0.5 ${e.style}`}>{e.label}</p>)}</>}
          </div>)}
        </div>
      </Card>
      <Card title="Upcoming">
        <ul className="space-y-3">{upcoming.map(([date, name]) => <li key={name} className="flex items-center gap-3 text-sm"><span className="w-14 rounded-lg bg-purple-50 py-1 text-center text-xs font-medium text-purple-700">{date}</span><span className="text-slate-700">{name}</span></li>)}</ul>
      </Card>
    </div>
  </PageShell>;
}

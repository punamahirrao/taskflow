import { Card, PageShell } from "../shared/components/MockupLayout";

const kpis = [
  { label: "Tasks completed", value: "128", delta: "+12% vs last month" },
  { label: "Avg. completion time", value: "3.4 days", delta: "-0.6 days" },
  { label: "Overdue tasks", value: "9", delta: "+2 this week" },
  { label: "Active projects", value: "6", delta: "No change" },
];
const weekly = [
  { week: "W1", done: 22, open: 14 }, { week: "W2", done: 30, open: 12 },
  { week: "W3", done: 26, open: 18 }, { week: "W4", done: 38, open: 10 },
];
const byProject = [
  { name: "Website Redesign", pct: 82 }, { name: "Mobile App", pct: 56 },
  { name: "Marketing Launch", pct: 71 }, { name: "API Migration", pct: 34 },
];

export default function ReportsPage() {
  return <PageShell title="Reports" subtitle="Track progress and productivity across your projects.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => <Card key={kpi.label}><p className="text-sm text-slate-500">{kpi.label}</p><p className="mt-2 text-3xl font-bold text-slate-900">{kpi.value}</p><p className="mt-1 text-xs text-slate-500">{kpi.delta}</p></Card>)}
    </div>
    <div className="mt-5 grid gap-5 xl:grid-cols-2">
      <Card title="Tasks per week">
        <div className="flex h-48 items-end gap-6" role="img" aria-label="Bar chart of completed and open tasks per week">
          {weekly.map((w) => <div key={w.week} className="flex flex-1 flex-col items-center gap-2"><div className="flex h-40 w-full items-end justify-center gap-1"><div className="w-6 rounded-t bg-purple-500" style={{ height: `${w.done * 4}px` }} /><div className="w-6 rounded-t bg-slate-300" style={{ height: `${w.open * 4}px` }} /></div><span className="text-xs text-slate-500">{w.week}</span></div>)}
        </div>
        <p className="mt-3 flex gap-4 text-xs text-slate-500"><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-purple-500" />Completed</span><span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-300" />Open</span></p>
      </Card>
      <Card title="Progress by project">
        <ul className="space-y-4">{byProject.map((p) => <li key={p.name}><div className="mb-1 flex justify-between text-sm"><span className="text-slate-700">{p.name}</span><span className="text-slate-500">{p.pct}%</span></div><div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-purple-500" style={{ width: `${p.pct}%` }} /></div></li>)}</ul>
      </Card>
    </div>
  </PageShell>;
}

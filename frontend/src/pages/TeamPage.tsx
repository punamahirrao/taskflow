import { Avatar, Card, PageShell } from "../shared/components/MockupLayout";

const members = [
  { name: "Maya Chen", role: "Product Manager", dept: "Product", tasks: 12, color: "bg-blue-100 text-blue-700" },
  { name: "Liam Novak", role: "Frontend Engineer", dept: "Engineering", tasks: 9, color: "bg-green-100 text-green-700" },
  { name: "Sofia Rossi", role: "Designer", dept: "Design", tasks: 7, color: "bg-pink-100 text-pink-700" },
  { name: "Arjun Patel", role: "Backend Engineer", dept: "Engineering", tasks: 11, color: "bg-amber-100 text-amber-700" },
  { name: "Emma Weber", role: "QA Analyst", dept: "Quality", tasks: 5, color: "bg-purple-100 text-purple-700" },
  { name: "Noah Kim", role: "Marketing Lead", dept: "Marketing", tasks: 6, color: "bg-cyan-100 text-cyan-700" },
];

export default function TeamPage() {
  return <PageShell subtitle="See who is on your team and what they are working on.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {members.map((m) => <Card key={m.name}>
        <div className="flex items-center gap-3"><Avatar name={m.name} color={m.color} /><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{m.name}</p><p className="truncate text-xs text-slate-500">{m.role}</p></div></div>
        <div className="mt-4 flex items-center justify-between text-xs"><span className="rounded-full bg-slate-100 px-2 py-1 text-slate-600">{m.dept}</span><span className="text-slate-500">{m.tasks} open tasks</span></div>
        <div className="mt-3 h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-purple-500" style={{ width: `${Math.min(100, m.tasks * 8)}%` }} /></div>
      </Card>)}
    </div>
  </PageShell>;
}

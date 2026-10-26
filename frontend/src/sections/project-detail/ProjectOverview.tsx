import { Check } from "lucide-react";
import type { Project } from "../../entities/project";
import type { Task, TaskStatus } from "../../entities/task";
import { memberInitials, memberName } from "../../shared/utils/people";
import { timeAgo } from "../../shared/utils/time";

const milestones: { status: TaskStatus; title: string; iconClass: string; barClass: string }[] = [
  { status: "todo", title: "Todo", iconClass: "border-gray-300 text-gray-400", barClass: "bg-gray-400" },
  { status: "in_progress", title: "In progress", iconClass: "border-blue-600 border-r-transparent", barClass: "bg-blue-600" },
  { status: "done", title: "Done", iconClass: "border-green-500 bg-green-500 text-white", barClass: "bg-green-500" },
];
const statusText: Record<TaskStatus, string> = { todo: "in Todo", in_progress: "in progress", done: "done" };

export function ProjectOverview({ project, tasks }: { project: Project; tasks: Task[] }) {
  const count = (status: TaskStatus) => tasks.filter((task) => task.status === status).length;
  const recentTasks = [...tasks].filter((task) => task.updated_at).sort((a, b) => (b.updated_at ?? "").localeCompare(a.updated_at ?? "")).slice(0, 3);
  return <div className="mt-2 grid grid-cols-1 gap-2 lg:grid-cols-[1fr_360px]">
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-900">Milestones</h2>
      <ol className="mt-5">{milestones.map((milestone, index) => {
        const amount = count(milestone.status);
        const percent = tasks.length ? Math.round(amount / tasks.length * 100) : 0;
        return <li key={milestone.status} className="relative flex gap-4 pb-8 last:pb-0">
          {index < milestones.length - 1 && <span className="absolute left-[11px] top-7 h-[calc(100%-1.75rem)] w-px bg-gray-200" />}
          <span className={`z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${milestone.iconClass}`}>{milestone.status === "done" && amount > 0 && <Check size={14} />}</span>
          <div className="w-32 shrink-0"><p className="text-sm font-semibold text-slate-900">{milestone.title}</p><p className="text-sm text-gray-600">{amount} of {tasks.length} tasks</p></div>
          <div className="flex flex-1 items-center gap-3"><span className="w-10 text-sm font-bold text-slate-900">{percent}%</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${milestone.barClass}`} style={{ width: `${percent}%` }} /></div></div>
        </li>;
      })}</ol>
    </section>
    <div className="flex flex-col gap-2">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="text-base font-bold text-slate-900">Project team</h2><span className="text-sm text-gray-500">{project.members?.length ?? 0} people</span></div>
        <ul className="mt-4 space-y-4">{(project.members ?? []).map((member) => <li key={member.id} className="flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">{memberInitials(member)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-900">{memberName(member)}</p><p className="truncate text-sm text-gray-500">{member.email}</p></div><span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${member.role === "owner" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>{member.role}</span></li>)}</ul>
      </section>
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="text-base font-bold text-slate-900">Recent updates</h2>
        {recentTasks.length === 0 ? <p className="mt-3 text-sm text-gray-500">No activity yet.</p> : <ul className="mt-4 space-y-4">{recentTasks.map((task) => {
          const author = project.members?.find((member) => member.id === task.created_by);
          return <li key={task.id} className="flex gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">{author ? memberInitials(author) : "?"}</span><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-semibold text-slate-900">{author ? memberName(author) : "Someone"}</p>{task.updated_at && <time className="shrink-0 text-xs text-gray-500">{timeAgo(task.updated_at)}</time>}</div><p className="text-sm text-gray-600">{task.title} is {statusText[task.status]}.</p></div></li>;
        })}</ul>}
      </section>
    </div>
  </div>;
}

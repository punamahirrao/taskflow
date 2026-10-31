import { AlertTriangle, ArrowRight, BellRing, CornerDownLeft, Pencil, UserRound, Zap } from "lucide-react";
import type { ProjectMember } from "../../../entities/project";
import type { Task } from "../../../entities/task";

export type SprintAction = "plan" | "add" | "backlog";

export function WorkItemCard({ task, candidates = [], members = [], sprintAction, sprintActionDisabled, onSprintAction, onEdit, onAssign, onEscalate, rollup, readiness }: {
  task: Task;
  candidates?: Task[];
  members?: ProjectMember[];
  sprintAction?: SprintAction;
  sprintActionDisabled?: boolean;
  onSprintAction?: () => void;
  onEdit?: () => void;
  onAssign?: (userId: number | null) => void;
  onEscalate?: () => void;
  rollup?: { done: number; total: number };
  readiness?: { ready: number; total: number };
}) {
  const unresolved = (task.blocked_by ?? []).some((id) => candidates.some((candidate) => candidate.id === id && candidate.status !== "done"));
  const isBlocked = task.blocked || unresolved;
  const actionIcon = sprintAction === "backlog" ? <CornerDownLeft size={15} />
    : sprintAction === "plan" ? <ArrowRight size={15} /> : <Zap size={15} />;
  const actionLabel = sprintAction === "backlog" ? "Remove from sprint and move to backlog"
    : sprintAction === "plan" ? "Move to current sprint" : "Add to current sprint";
  const memberOptions = [...members].sort((first, second) => `${first.first_name} ${first.last_name}`.localeCompare(`${second.first_name} ${second.last_name}`));

  return <article className="flex min-h-14 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm transition hover:border-violet-200 hover:shadow-md">
    <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${task.priority === "urgent" ? "bg-rose-500" : task.priority === "high" ? "bg-orange-400" : task.priority === "medium" ? "bg-sky-400" : "bg-slate-300"}`} title={`${task.priority} priority`} />
    <span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800" title={task.title}>{task.title}</span>
    {isBlocked && <AlertTriangle size={15} aria-label="Blocked" className="shrink-0 text-rose-600" />}
    {task.escalated && <span className="rounded bg-rose-100 px-1.5 py-1 text-[9px] font-bold uppercase text-rose-700">Escalated</span>}
    {task.status === "done" && task.definition_done?.some((check) => !check.done) && <span title="Definition of Done checklist is incomplete" className="rounded bg-amber-50 px-1.5 py-1 text-[9px] font-semibold text-amber-700">DoD {task.definition_done.filter((check) => check.done).length}/{task.definition_done.length}</span>}
    {rollup && <span title="Completed child work" className="rounded bg-violet-50 px-1.5 py-1 text-[9px] font-semibold text-violet-700">{rollup.done}/{rollup.total}</span>}
    {readiness && <span title="Definition of Ready" className={`rounded px-1.5 py-1 text-[9px] font-semibold ${readiness.ready === readiness.total ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>Ready {readiness.ready}/{readiness.total}</span>}
    {isBlocked && !task.escalated && onEscalate && <button type="button" onClick={onEscalate} aria-label={`Escalate blocker on ${task.title}`} title="Escalate blocker" className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><BellRing size={14} /></button>}
    {task.tags?.[0] && <span className="hidden max-w-24 truncate rounded bg-slate-100 px-2 py-1 text-[10px] text-slate-500 sm:block">{task.tags[0]}</span>}
    {onAssign ? <details className="relative shrink-0">
      <summary aria-label={task.assignee === null ? "Assign a team member" : `Change assignee from ${task.assignee_name}`} title={task.assignee === null ? "Assign a team member" : task.assignee_name} className="flex h-8 w-8 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-400 hover:border-violet-300 hover:text-violet-600">
        {task.assignee_photo_url ? <img src={task.assignee_photo_url} alt={task.assignee_name} className="h-full w-full object-cover" /> : task.assignee !== null ? <span className="bg-violet-100 text-[10px] font-semibold text-violet-700">{task.assignee_name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span> : <UserRound size={16} aria-hidden="true" />}
      </summary>
      <div className="absolute right-0 z-30 mt-2 max-h-64 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
        <button type="button" onClick={(event) => { onAssign(null); event.currentTarget.closest("details")?.removeAttribute("open"); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400"><UserRound size={14} /></span>Unassigned</button>
        {memberOptions.map((member) => <button key={member.id} type="button" onClick={(event) => { onAssign(member.id); event.currentTarget.closest("details")?.removeAttribute("open"); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 hover:bg-violet-50">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-violet-100 text-[10px] font-semibold text-violet-700">{member.photo_url ? <img src={member.photo_url} alt="" className="h-full w-full object-cover" /> : `${member.first_name[0] ?? ""}${member.last_name[0] ?? ""}`}</span>
          <span className="min-w-0 truncate">{member.first_name} {member.last_name}</span>{task.assignee === member.id && <span className="ml-auto text-[10px] text-violet-600">Assigned</span>}
        </button>)}
        {task.assignee !== null && !memberOptions.some((member) => member.id === task.assignee) && <p className="px-3 py-2 text-[10px] text-slate-400">Current assignee is no longer on this project.</p>}
      </div>
    </details> : <span aria-label={task.assignee === null ? "Unassigned" : `Assigned to ${task.assignee_name}`} title={task.assignee === null ? "Unassigned" : task.assignee_name} className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-400">
      {task.assignee_photo_url ? <img src={task.assignee_photo_url} alt={task.assignee_name} className="h-full w-full object-cover" /> : task.assignee !== null ? <span className="bg-violet-100 text-[10px] font-semibold text-violet-700">{task.assignee_name.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span> : <UserRound size={16} aria-hidden="true" />}
    </span>}
    {onEdit && <button type="button" onClick={onEdit} aria-label={`Edit ${task.title}`} title="Edit work item" className="rounded-lg p-2 text-slate-400 hover:bg-violet-50 hover:text-violet-700"><Pencil size={15} /></button>}
    {sprintAction && onSprintAction && <button type="button" onClick={onSprintAction} disabled={sprintActionDisabled} aria-label={actionLabel} title={actionLabel} className="rounded-lg p-2 text-violet-600 hover:bg-violet-50 disabled:cursor-not-allowed disabled:text-slate-300">{actionIcon}</button>}
  </article>;
}

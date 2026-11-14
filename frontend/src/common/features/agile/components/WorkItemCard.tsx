import { AlertTriangle, ArrowRight, BellRing, CalendarDays, CornerDownLeft, Pencil, UserRound, X, Zap } from "lucide-react";
import type { MouseEvent, KeyboardEvent } from "react";
import type { ProjectMember } from "../../../entities/project";
import type { Task, WorkItemReadiness, WorkItemRollup } from "../../../entities/task";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export type SprintAction = "plan" | "add" | "backlog";

interface WorkItemCardProps {
  task: Task;
  candidates?: Task[];
  members?: ProjectMember[];
  sprintAction?: SprintAction;
  sprintActionDisabled?: boolean;
  onSprintAction?: () => void;
  onEdit?: () => void;
  onAssign?: (userId: number | null) => void;
  onEscalate?: () => void;
  rollup?: WorkItemRollup;
  readiness?: WorkItemReadiness;
  compact?: boolean;
}

export function WorkItemCard({ task, candidates = [], members = [], sprintAction, sprintActionDisabled, onSprintAction, onEdit, onAssign, onEscalate, rollup, readiness, compact = false }: WorkItemCardProps) {
  const { t } = useTranslation();
  const unresolved = (task.blocked_by ?? []).some((id) => candidates.some((candidate) => candidate.id === id && candidate.status !== "done"));
  const isBlocked = task.blocked || unresolved;
  const actionIcon = sprintAction === "backlog" ? <CornerDownLeft size={15} /> : sprintAction === "plan" ? <ArrowRight size={15} /> : <Zap size={15} />;
  const actionLabel = sprintAction === "backlog" ? t("agile.removeFromSprint") : sprintAction === "plan" ? t("agile.moveToCurrentSprint") : t("agile.addToCurrentSprint");
  const memberOptions = [...members].sort((first, second) => `${first.first_name} ${first.last_name}`.localeCompare(`${second.first_name} ${second.last_name}`));
  const initials = task.assignee_name.split(" ").map((part) => part[0]).join("").slice(0, 2);

  function openCard() { onEdit?.(); }
  function stop(event: MouseEvent<HTMLElement>) { event.stopPropagation(); }
  function onCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if ((event.key === "Enter" || event.key === " ") && event.target === event.currentTarget) {
      event.preventDefault();
      openCard();
    }
  }

  if (compact) return <article role={onEdit ? "group" : undefined} aria-label={onEdit ? t("agile.taskAria", { title: task.title }) : undefined} tabIndex={onEdit ? 0 : undefined} onClick={openCard} onKeyDown={onCardKeyDown} className={`flex min-h-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-left transition hover:border-indigo-300 hover:bg-slate-50 ${onEdit ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" : ""}`}>
    <div className="min-w-0 flex-1"><div className="flex min-w-0 items-center gap-2">
      {onAssign ? <details className="relative shrink-0" onClick={stop}><summary aria-label={task.assignee === null ? t("agile.assignMember") : t("agile.changeAssignee", { name: task.assignee_name })} title={task.assignee === null ? t("agile.unassigned") : task.assignee_name} className="flex size-7 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-500">{task.assignee_photo_url ? <img src={task.assignee_photo_url} alt={task.assignee_name} className="size-full object-cover" /> : task.assignee !== null ? <span className="text-[9px] font-semibold text-indigo-700">{initials}</span> : <UserRound size={13} />}</summary><div className="absolute bottom-full left-0 z-30 mb-2 max-h-64 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl"><button type="button" onClick={(event) => { stop(event); onAssign(null); event.currentTarget.closest("details")?.removeAttribute("open"); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"><UserRound size={14} />{t("agile.unassigned")}</button>{memberOptions.map((member) => <button key={member.id} type="button" onClick={(event) => { stop(event); onAssign(member.id); event.currentTarget.closest("details")?.removeAttribute("open"); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 hover:bg-indigo-50"><span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">{member.photo_url ? <img src={member.photo_url} alt="" className="size-full object-cover" /> : `${member.first_name[0] ?? ""}${member.last_name[0] ?? ""}`}</span>{member.first_name} {member.last_name}</button>)}</div></details> : <span aria-label={task.assignee === null ? t("agile.unassigned") : t("agile.assignedTo", { name: task.assignee_name })} title={task.assignee_name || t("agile.unassigned")} className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-500">{task.assignee_photo_url ? <img src={task.assignee_photo_url} alt={task.assignee_name} className="size-full object-cover" /> : task.assignee !== null ? <span className="text-[9px] font-semibold text-indigo-700">{initials}</span> : <UserRound size={13} />}</span>}
      <h4 className="min-w-0 flex-1 truncate text-sm font-semibold leading-5 text-slate-900" title={task.title}>{task.title}</h4>
      <div className="flex shrink-0 items-center gap-0.5" onClick={stop}>{isBlocked && !task.escalated && onEscalate && <button type="button" onClick={onEscalate} aria-label={t("agile.escalateBlockerOn", { title: task.title })} title={t("agile.escalateBlocker")} className="rounded p-1.5 text-rose-500 hover:bg-rose-50"><BellRing size={14} /></button>}{sprintAction && onSprintAction && <button type="button" onClick={onSprintAction} disabled={sprintActionDisabled} aria-label={actionLabel} title={actionLabel} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-700 disabled:opacity-40">{compact && sprintAction === "backlog" ? <X size={15} /> : actionIcon}</button>}</div>
    </div><div className="mt-1 flex items-center gap-2 pl-9 text-[10px] text-slate-500"><span className={`font-semibold capitalize ${priorityText(task.priority)}`}>{task.priority}</span>{task.estimate && <span>{t("agile.points", { estimate: task.estimate })}</span>}{task.tags[0] && <span className="max-w-36 truncate">· {task.tags[0]}</span>}{isBlocked && <span className="font-semibold text-rose-600">· {t("agile.blocked")}</span>}</div></div>
  </article>;

  return <article role={onEdit ? "group" : undefined} aria-label={onEdit ? t("agile.taskCardAria", { title: task.title }) : undefined} tabIndex={onEdit ? 0 : undefined} onClick={openCard} onKeyDown={onCardKeyDown} className={`group relative flex min-h-[190px] flex-col overflow-visible rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg ${onEdit ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" : ""}`}>
    <div className="flex items-start justify-between gap-2">
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className={`rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-wide ${priorityStyle(task.priority)}`}>{task.priority}</span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-600">{task.work_type}</span>
      </div>
      <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${priorityDot(task.priority)}`} title={t("agile.priorityTitle", { priority: task.priority })} />
    </div>

    <h4 className="mt-3 line-clamp-2 text-[15px] font-bold leading-5 text-slate-900">{task.title}</h4>
    {task.description && <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-slate-500">{task.description}</p>}

    <div className="mt-3 flex min-h-6 flex-wrap items-center gap-1.5">
      {isBlocked && <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-[9px] font-semibold text-rose-700"><AlertTriangle size={11} />{t("agile.blocked")}</span>}
      {task.escalated && <span className="rounded-lg bg-rose-100 px-2 py-1 text-[9px] font-bold uppercase text-rose-700">{t("agile.escalated")}</span>}
      {task.status === "done" && task.definition_done?.some((check) => !check.done) && <span title={t("agile.dodIncomplete")} className="rounded-lg bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700">{t("agile.dodProgress", { done: task.definition_done.filter((check) => check.done).length, total: task.definition_done.length })}</span>}
      {rollup && <span title={t("agile.completedChildWork")} className="rounded-lg bg-violet-50 px-2 py-1 text-[9px] font-semibold text-violet-700">{t("agile.childItems", { done: rollup.done, total: rollup.total })}</span>}
      {readiness && <span title={t("agile.definitionOfReady")} className={`rounded-lg px-2 py-1 text-[9px] font-semibold ${readiness.ready === readiness.total ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{t("agile.readyProgress", { ready: readiness.ready, total: readiness.total })}</span>}
      {task.tags?.slice(0, 2).map((tag) => <span key={tag} className="max-w-28 truncate rounded-lg bg-indigo-50 px-2 py-1 text-[9px] font-semibold text-indigo-700">{tag}</span>)}
      {task.due_date && <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-[9px] font-medium text-slate-600"><CalendarDays size={10} />{task.due_date}</span>}
    </div>

    <footer className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
      {onAssign ? <details className="relative shrink-0" onClick={stop}>
        <summary aria-label={task.assignee === null ? t("agile.assignMember") : t("agile.changeAssignee", { name: task.assignee_name })} title={task.assignee === null ? t("agile.assignMember") : task.assignee_name} className="flex h-8 w-8 cursor-pointer list-none items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-500 hover:border-indigo-300 hover:text-indigo-600">
          {task.assignee_photo_url ? <img src={task.assignee_photo_url} alt={task.assignee_name} className="h-full w-full object-cover" /> : task.assignee !== null ? <span className="text-[10px] font-semibold text-indigo-700">{initials}</span> : <UserRound size={15} aria-hidden="true" />}
        </summary>
        <div className="absolute bottom-full left-0 z-30 mb-2 max-h-64 w-64 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <button type="button" onClick={(event) => { stop(event); onAssign(null); event.currentTarget.closest("details")?.removeAttribute("open"); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-400"><UserRound size={14} /></span>{t("agile.unassigned")}</button>
          {memberOptions.map((member) => <button key={member.id} type="button" onClick={(event) => { stop(event); onAssign(member.id); event.currentTarget.closest("details")?.removeAttribute("open"); }} className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-slate-700 hover:bg-indigo-50">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-indigo-100 text-[10px] font-semibold text-indigo-700">{member.photo_url ? <img src={member.photo_url} alt="" className="h-full w-full object-cover" /> : `${member.first_name[0] ?? ""}${member.last_name[0] ?? ""}`}</span>
            <span className="min-w-0 truncate">{member.first_name} {member.last_name}</span>{task.assignee === member.id && <span className="ml-auto text-[10px] text-indigo-600">{t("agile.assigned")}</span>}
          </button>)}
          {task.assignee !== null && !memberOptions.some((member) => member.id === task.assignee) && <p className="px-3 py-2 text-[10px] text-slate-400">{t("agile.assigneeLeftProject")}</p>}
        </div>
      </details> : <span aria-label={task.assignee === null ? t("agile.unassigned") : t("agile.assignedTo", { name: task.assignee_name })} title={task.assignee === null ? t("agile.unassigned") : task.assignee_name} className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100 text-slate-500">
        {task.assignee_photo_url ? <img src={task.assignee_photo_url} alt={task.assignee_name} className="h-full w-full object-cover" /> : task.assignee !== null ? <span className="text-[10px] font-semibold text-indigo-700">{initials}</span> : <UserRound size={15} aria-hidden="true" />}
      </span>}

      <div className="flex items-center gap-1" onClick={stop}>
        {isBlocked && !task.escalated && onEscalate && <button type="button" onClick={(event) => { stop(event); onEscalate(); }} aria-label={t("agile.escalateBlockerOn", { title: task.title })} title={t("agile.escalateBlocker")} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50"><BellRing size={14} /></button>}
        {sprintAction && onSprintAction && <button type="button" onClick={(event) => { stop(event); onSprintAction(); }} disabled={sprintActionDisabled} aria-label={actionLabel} title={actionLabel} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:text-slate-300">{actionIcon}</button>}
        {onEdit && <button type="button" onClick={(event) => { stop(event); openCard(); }} aria-label={t("agile.openDetailsFor", { title: task.title })} title={t("agile.openTaskDetails")} className="rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-700"><Pencil size={14} /></button>}
      </div>
    </footer>
  </article>;
}

function priorityStyle(priority: Task["priority"]) {
  return priority === "urgent" ? "bg-rose-100 text-rose-700" : priority === "high" ? "bg-orange-100 text-orange-700" : priority === "medium" ? "bg-sky-100 text-sky-700" : "bg-slate-100 text-slate-600";
}

function priorityDot(priority: Task["priority"]) {
  return priority === "urgent" ? "bg-rose-500" : priority === "high" ? "bg-orange-500" : priority === "medium" ? "bg-sky-500" : "bg-slate-400";
}

function priorityText(priority: Task["priority"]) {
  return priority === "urgent" ? "text-rose-700" : priority === "high" ? "text-orange-700" : priority === "medium" ? "text-sky-700" : "text-slate-500";
}

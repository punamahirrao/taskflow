import { CalendarClock, Plus } from "lucide-react";
import type { Sprint } from "../../common/entities/task";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";

interface BacklogSprintPanelProps {
  projectId: number | null;
  projectRole?: string | null;
  sprints: Sprint[];
  activeSprints: Sprint[];
  activeSprint?: Sprint;
  onSelectActive: (sprintId: number) => void;
  readyCount: number;
  backlogPoints: number;
  busy: boolean;
  name: string;
  setName: (value: string) => void;
  goal: string;
  setGoal: (value: string) => void;
  capacity: string;
  setCapacity: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
  onCreate: () => void;
  onPlanReady: () => void;
  onStartPlanned: (sprint: Sprint) => void;
  onClose: (sprintId: number) => void;
  onUpdate: (sprintId: number, changes: Partial<Sprint>) => void;
}

export function BacklogSprintPanel(props: BacklogSprintPanelProps) {
  const { t } = useTranslation();
  const { projectId, projectRole, sprints, activeSprints, activeSprint, readyCount, backlogPoints, busy } = props;
  const canManage = ["owner", "admin"].includes(projectRole ?? "");
  const completedSprints = sprints.filter((sprint) => sprint.is_closed && sprint.velocity_points !== null).slice(0, 3);
  const velocity = completedSprints.length ? completedSprints.reduce((sum, sprint) => sum + (sprint.velocity_points ?? 0), 0) / completedSprints.length : 0;

  if (!projectId) return <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3 text-xs text-slate-500">{t("backlog.selectProject")}</div>;

  return <section className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
    <div className="flex flex-wrap items-center gap-2"><CalendarClock size={16} className="text-violet-600" />{activeSprint ? <><span className="text-xs text-slate-500">{t("backlog.currentSprint")}</span>{activeSprints.length > 1 ? <select aria-label={t("backlog.currentSprint")} value={activeSprint.id} onChange={(event) => props.onSelectActive(Number(event.target.value))} className="max-w-64 rounded-lg border border-violet-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-violet-700">{activeSprints.map((sprint) => <option key={sprint.id} value={sprint.id}>{sprint.name}</option>)}</select> : <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700">{activeSprint.name}</span>}<button type="button" disabled={!readyCount || busy} onClick={props.onPlanReady} className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-40">{t("backlog.planReady", { count: readyCount })}</button><button type="button" disabled={busy || !canManage} onClick={() => props.onClose(activeSprint.id)} className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:border-rose-200 hover:text-rose-700 disabled:opacity-40">{t("backlog.closeSprint")}</button></> : <span className="text-xs text-slate-500">{t("backlog.noCurrentSprint")}</span>}</div>
    <form onSubmit={(event) => { event.preventDefault(); props.onCreate(); }} className="mt-3 flex flex-wrap items-center gap-2">
      <input value={props.name} onChange={(event) => props.setName(event.target.value)} placeholder={activeSprint ? t("backlog.upcomingSprintName") : t("backlog.sprintName")} aria-label={t("backlog.sprintName")} className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm" />
      <input value={props.goal} onChange={(event) => props.setGoal(event.target.value)} placeholder={t("backlog.sprintGoal")} aria-label={t("backlog.sprintGoal")} className="min-w-48 flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm" />
      <label className="text-[10px] text-slate-400">{t("backlog.capacity")}<input type="number" min="1" value={props.capacity} onChange={(event) => props.setCapacity(event.target.value)} placeholder={t("backlog.points")} aria-label={t("backlog.capacityPointsAria")} className="ml-1 w-20 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600" /></label>
      <label className="text-[10px] text-slate-400">{t("backlog.startDate")}<input type="date" value={props.startDate} onChange={(event) => props.setStartDate(event.target.value)} className="ml-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600" /></label>
      <label className="text-[10px] text-slate-400">{t("backlog.endDate")}<input type="date" value={props.endDate} onChange={(event) => props.setEndDate(event.target.value)} className="ml-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600" /></label>
      <button disabled={busy || !props.name.trim()} className="inline-flex items-center gap-1 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-40"><Plus size={13} />{t("backlog.planUpcomingSprint")}</button>
    </form>
    {activeSprint && <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t("backlog.sprintGoal")}<input key={`${activeSprint.id}-${activeSprint.goal}`} defaultValue={activeSprint.goal} onBlur={(event) => { if (event.target.value !== activeSprint.goal) props.onUpdate(activeSprint.id, { goal: event.target.value }); }} placeholder={t("backlog.sprintGoalPlaceholder")} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700" /></label>
      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t("backlog.capacityPoints")}<input key={`${activeSprint.id}-${activeSprint.capacity_points}`} type="number" min="1" defaultValue={activeSprint.capacity_points ?? ""} onBlur={(event) => { const value = event.target.value ? Number(event.target.value) : null; if (value !== activeSprint.capacity_points) props.onUpdate(activeSprint.id, { capacity_points: value }); }} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal normal-case tracking-normal text-slate-700" /></label>
    </div>}
    {sprints.some((sprint) => !sprint.is_active && !sprint.is_closed) && <div className="mt-3 flex flex-wrap items-center gap-2">{sprints.filter((sprint) => !sprint.is_active && !sprint.is_closed).map((sprint) => <div key={sprint.id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="text-xs font-medium text-slate-700">{sprint.name}</span>{sprint.start_date && <span className="text-[10px] text-slate-400">{sprint.start_date}{sprint.end_date ? ` – ${sprint.end_date}` : ""}</span>}<button type="button" disabled={busy || !canManage} onClick={() => props.onStartPlanned(sprint)} className="text-[10px] font-semibold text-violet-700 disabled:text-slate-300">{t("backlog.startPlanned")}</button></div>)}</div>}
    {activeSprint && <p className="mt-2 text-[11px] text-slate-500">{velocity ? t(Math.ceil(backlogPoints / velocity) === 1 ? "backlog.forecastOne" : "backlog.forecastMany", { points: backlogPoints, velocity: velocity.toFixed(1), sprints: Math.ceil(backlogPoints / velocity) }) : t("backlog.forecastPending")}</p>}
    {sprints.some((sprint) => sprint.is_closed) && <div className="mt-4 space-y-2">{sprints.filter((sprint) => sprint.is_closed).slice(0, 2).map((sprint) => <details key={sprint.id} className="rounded-lg border border-slate-200 bg-white p-3"><summary className="cursor-pointer text-xs font-semibold text-slate-700">{t("backlog.sprintReview", { name: sprint.name, points: sprint.velocity_points ?? 0 })}</summary><p className="mt-2 text-xs text-slate-600">{sprint.outcome_summary || t("backlog.noOutcomeSummary")}</p><label className="mt-2 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">{t("backlog.retrospective")}<textarea key={`${sprint.id}-${sprint.retrospective}`} defaultValue={sprint.retrospective} rows={2} placeholder={t("backlog.retrospectivePlaceholder")} onBlur={(event) => { if (event.target.value !== sprint.retrospective) props.onUpdate(sprint.id, { retrospective: event.target.value }); }} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-xs font-normal normal-case tracking-normal text-slate-700" /></label></details>)}</div>}
  </section>;
}

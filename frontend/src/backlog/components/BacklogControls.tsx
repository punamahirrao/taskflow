import { Check, CircleHelp, Search, Sparkles } from "lucide-react";
import type { Task } from "../../common/entities/task";
import type { TranslationKey } from "../../common/entities/language";
import { useTranslation } from "../../common/shared/i18n/hooks/useTranslation";
import type { Suggestion } from "../entities/backlog";
import type { BacklogGroupBy } from "../features/agile/utils/backlog";

export type BacklogMode = "groom" | "estimate";

const GROUP_OPTIONS: [BacklogGroupBy, TranslationKey][] = [["project", "backlog.project"], ["theme", "backlog.themeTag"], ["parent", "backlog.epicInitiative"]];
const READINESS_LABELS: TranslationKey[] = ["backlog.description", "backlog.estimate", "backlog.dorAssignee", "backlog.dorDependencies"];

interface BacklogControlsProps {
  mode: BacklogMode; setMode: (mode: BacklogMode) => void; groupBy: BacklogGroupBy; setGroupBy: (group: BacklogGroupBy) => void;
  search: string; setSearch: (value: string) => void; suggestions: Suggestion[]; onSetPriority: (task: Task, priority: Task["priority"]) => void;
}

export function BacklogControls({ mode, setMode, groupBy, setGroupBy, search, setSearch, suggestions, onSetPriority }: BacklogControlsProps) {
  const { t } = useTranslation();
  return <>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4 md:px-5"><div><h3 className="font-semibold text-slate-900">{t("backlog.prioritizedWork")}</h3><p className="mt-0.5 text-xs text-slate-500">{t("backlog.dragHint")}</p></div><div className="flex flex-wrap items-center gap-2"><label className="flex items-center gap-2 text-xs text-slate-500">{t("backlog.group")}<select aria-label={t("backlog.groupByAria")} value={groupBy} onChange={(event) => setGroupBy(event.target.value as BacklogGroupBy)} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-medium text-slate-700">{GROUP_OPTIONS.map(([value, labelKey]) => <option key={value} value={value}>{t(labelKey)}</option>)}</select></label><div className="relative"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input aria-label={t("backlog.searchAria")} value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t("backlog.findWork")} className="w-44 rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-violet-200" /></div><div className="flex rounded-lg bg-slate-100 p-1"><button type="button" onClick={() => setMode("groom")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === "groom" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}>{t("backlog.refine")}</button><button type="button" onClick={() => setMode("estimate")} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${mode === "estimate" ? "bg-white text-violet-700 shadow-sm" : "text-slate-500"}`}>{t("backlog.estimate")}</button></div></div></div>
    {mode === "groom" && <div className="border-b border-emerald-100 bg-emerald-50/70 px-5 py-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-semibold text-emerald-900">{t("backlog.refinementTitle")}</p><p className="text-[11px] text-emerald-800">{t("backlog.refinementHint")}</p></div><div className="mt-2 flex flex-wrap gap-3 text-[10px] text-emerald-800">{READINESS_LABELS.map((labelKey) => <span key={labelKey} className="inline-flex items-center gap-1"><Check size={12} />{t(labelKey)}</span>)}</div></div>}
    {mode === "estimate" && <div className="flex gap-2 border-b border-violet-100 bg-violet-50 px-5 py-3 text-xs text-violet-800"><CircleHelp size={15} className="shrink-0" /><p>{t("backlog.estimationMode")}</p></div>}
    {suggestions.length > 0 && <div className="border-b border-amber-100 bg-amber-50/70 px-5 py-3"><div className="mb-2 flex items-center gap-2"><Sparkles size={14} className="text-amber-600" /><p className="text-xs font-semibold text-amber-900">{t("backlog.prioritySuggestions")}</p><span className="text-[10px] text-amber-700">{t("backlog.suggestionBasis")}</span></div><div className="flex flex-wrap gap-2">{suggestions.map(({ task, priority, reason }) => <button key={task.id} type="button" onClick={() => onSetPriority(task, priority)} title={reason} className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-left text-[11px] text-slate-700 hover:border-amber-400"><span className="font-semibold">{task.title}</span><span className="ml-2 text-amber-700">→ {priority}</span></button>)}</div><p className="mt-1 text-[9px] text-amber-700">{t("backlog.suggestionDisclaimer")}</p></div>}
  </>;
}

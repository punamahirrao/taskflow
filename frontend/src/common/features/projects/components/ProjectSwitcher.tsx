import { Check, ChevronDown, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAccessibleAgileBoards } from "../../../../project-detail/api/tasks";
import type { AgileBoard } from "../../../entities/task";
import { useProjectContext } from "../context/useProjectContext";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

export default function ProjectSwitcher() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { projects, loading, selectedId, select } = useProjectContext();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [boards, setBoards] = useState<AgileBoard[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const current = projects.find((project) => project.id === selectedId);
  const label = loading ? t("common.loading") : current?.name ?? t("projectSwitcher.allProjects");

  useEffect(() => {
    let active = true;
    void getAccessibleAgileBoards().then((result) => { if (active) setBoards(result); }).catch(() => { if (active) setBoards([]); });
    return () => { active = false; };
  }, [projects.length]);

  function choose(projectId: number | null) {
    select(projectId);
    setOpen(false);
    navigate(projectId === null ? "/projects" : `/project/${projectId}`);
  }

  const option = "flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-purple-50";

  return <div
    ref={ref}
    className="relative mb-6"
    onFocus={() => setOpen(true)}
    onBlur={(event) => { if (!ref.current?.contains(event.relatedTarget)) setOpen(false); }}
    onKeyDown={(event) => { if (event.key === "Escape") setOpen(false); }}
  >
    <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={t("projectSwitcher.projectAria", { label })} onClick={() => setOpen((value) => !value)} className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm font-medium text-gray-800 focus:outline-none ${open ? "border-gray-300 bg-white shadow-sm" : "border-transparent hover:bg-gray-200/70"}`}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-700 text-white"><Layers size={14} aria-hidden="true" /></span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {open && <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-gray-500" />}
    </button>
    {open && <ul role="listbox" aria-label={t("projectSwitcher.selectProject")} className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
      <li role="option" aria-selected={selectedId === null}><button type="button" onClick={() => choose(null)} className={option}><span className="flex-1">{t("projectSwitcher.allProjects")}</span>{selectedId === null && <Check size={14} aria-hidden="true" className="text-purple-700" />}</button></li>
      {projects.map((project) => <li key={project.id} role="option" aria-selected={project.id === selectedId}><button type="button" onClick={() => choose(project.id)} className={option}><span className="min-w-0 flex-1 truncate">{project.name}</span>{project.is_default && <span className="rounded bg-purple-100 px-1.5 text-[10px] font-medium text-purple-700">{t("projectSwitcher.default")}</span>}{project.id === selectedId && <Check size={14} aria-hidden="true" className="text-purple-700" />}</button></li>)}
      {pathname.startsWith("/boards/") && boards.length > 1 && <li className="mt-2 border-t border-slate-200 pt-2"><p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">{t("boards.chooseBoard")}</p>{boards.slice(0, 8).map((board) => <button key={board.id} type="button" onClick={() => { setOpen(false); navigate(`/boards/${board.id}?project=${board.project}`); }} className={option}>{board.name}</button>)}</li>}
    </ul>}
  </div>;
}

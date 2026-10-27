import { Check, ChevronDown, Layers } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectContext } from "../context/useProjectContext";

export default function ProjectSwitcher() {
  const navigate = useNavigate();
  const { projects, loading, selectedId, select } = useProjectContext();
  const [open, setOpen] = useState(false);
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
  const label = loading ? "Loading..." : current?.name ?? "All Projects";

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
    <button type="button" aria-haspopup="listbox" aria-expanded={open} aria-label={`Project: ${label}`} onClick={() => setOpen((value) => !value)} className={`flex w-full cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-sm font-medium text-gray-800 focus:outline-none ${open ? "border-gray-300 bg-white shadow-sm" : "border-transparent hover:bg-gray-200/70"}`}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-purple-700 text-white"><Layers size={14} aria-hidden="true" /></span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {open && <ChevronDown size={16} aria-hidden="true" className="shrink-0 text-gray-500" />}
    </button>
    {open && <ul role="listbox" aria-label="Select project" className="absolute left-0 right-0 z-30 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
      <li role="option" aria-selected={selectedId === null}><button type="button" onClick={() => choose(null)} className={option}><span className="flex-1">All Projects</span>{selectedId === null && <Check size={14} aria-hidden="true" className="text-purple-700" />}</button></li>
      {projects.map((project) => <li key={project.id} role="option" aria-selected={project.id === selectedId}><button type="button" onClick={() => choose(project.id)} className={option}><span className="min-w-0 flex-1 truncate">{project.name}</span>{project.is_default && <span className="rounded bg-purple-100 px-1.5 text-[10px] font-medium text-purple-700">Default</span>}{project.id === selectedId && <Check size={14} aria-hidden="true" className="text-purple-700" />}</button></li>)}
    </ul>}
  </div>;
}

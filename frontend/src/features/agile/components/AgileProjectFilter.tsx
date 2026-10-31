import type { Project } from "../../../entities/project";

export function AgileProjectFilter({ projects, value, onChange }: { projects: Project[]; value: number | null; onChange: (value: string) => void }) {
  return <label className="flex min-w-44 flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
    Project scope
    <select aria-label="Project scope" value={value ?? "all"} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-800 outline-none focus:ring-2 focus:ring-violet-300">
      <option value="all">All projects</option>
      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
    </select>
  </label>;
}

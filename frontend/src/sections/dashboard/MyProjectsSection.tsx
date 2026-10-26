import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { sampleProjects } from "../../features/dashboard/data/sampleDashboard";

export function MyProjectsSection() {
  const navigate = useNavigate();
  return <section aria-labelledby="my-projects-title" className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 id="my-projects-title" className="text-lg font-semibold tracking-tight text-slate-900">My projects</h2>
      <button type="button" onClick={() => navigate("/projects")} className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"><span>View all projects</span><ArrowRight size={16} aria-hidden="true" /></button>
    </div>
    <div className="space-y-3">{sampleProjects.map((project) => {
      const Icon = project.icon;
      return <article key={project.name} className="rounded-xl border border-slate-100 p-3 sm:p-4">
        <div className="grid grid-cols-[40px_minmax(0,1fr)] items-start gap-3 sm:grid-cols-[44px_minmax(0,1fr)_auto] sm:items-center">
          <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${project.iconClass}`}><Icon size={20} aria-hidden="true" /></span>
          <div className="min-w-0"><h3 className="truncate text-sm font-semibold text-slate-800">{project.name}</h3><p className="mt-0.5 truncate text-xs text-slate-500">{project.description}</p></div>
          <span className={`col-start-2 mt-1 w-fit rounded-full px-2.5 py-1 text-xs font-medium sm:col-start-auto sm:mt-0 ${project.status === "At risk" ? "bg-orange-50 text-orange-700" : "bg-teal-50 text-teal-700"}`}>{project.status}</span>
        </div>
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 sm:ml-[56px]">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-label={`${project.name} progress`} aria-valuenow={project.progress} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full ${project.barClass}`} style={{ width: `${project.progress}%` }} /></div>
          <div className="flex -space-x-2" aria-label={`Team: ${project.people.join(", ")}`}>
            {project.people.map((person) => <span key={person} aria-hidden="true" className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-200 text-[9px] font-semibold text-slate-600">{person}</span>)}
            <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-[9px] font-medium text-slate-500">+{project.extraPeople}</span>
          </div>
          <span className="text-xs font-medium text-slate-500">{project.progress}%</span><span className="text-right text-xs text-slate-500">{project.due}</span>
        </div>
      </article>;
    })}</div>
  </section>;
}

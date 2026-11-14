import type { Project } from "../../../entities/project";
import { useTranslation } from "../../../shared/i18n/hooks/useTranslation";

interface AgileProjectFilterProps {
  projects: Project[];
  value: number | null;
  onChange: (value: string) => void;
}

export function AgileProjectFilter({ projects, value, onChange }: AgileProjectFilterProps) {
  const { t } = useTranslation();
  return <label className="flex min-w-44 flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
    {t("agile.projectScope")}
    <select aria-label={t("agile.projectScope")} value={value ?? "all"} onChange={(event) => onChange(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium normal-case tracking-normal text-slate-800 outline-none focus:ring-2 focus:ring-violet-300">
      <option value="all">{t("agile.allProjects")}</option>
      {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
    </select>
  </label>;
}

import { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import TeamPage from "../team/TeamPage";
import { WorkflowConfigDialog } from "./components/WorkflowConfigDialog";

type SettingsTab = "workflow" | "team";

export default function ProjectSettingsPage() {
  const { id } = useParams();
  const projectId = Number(id);
  const { projects, loading } = useProjectContext();
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [configureWorkflow, setConfigureWorkflow] = useState(false);
  const activeTab: SettingsTab = params.get("tab") === "team" ? "team" : "workflow";
  const project = projects.find((item) => item.id === projectId);

  if (loading) return <main className="p-8 text-sm text-slate-500">{t("common.loading")}</main>;
  if (!project) return <main className="p-8 text-sm text-rose-600">{t("projectDetail.notFound")}</main>;

  return <main className="min-h-screen bg-slate-50 p-2">
    <div className="w-full">
      <header className="mb-5"><p className="text-xs font-semibold uppercase tracking-wide text-violet-600">{project.name}</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{t("app.projectSettings")}</h2></header>
      <nav aria-label={t("app.projectSettings")} className="mb-5 flex gap-5 border-b border-slate-200">
        {(["workflow", "team"] as const).map((tab) => <button key={tab} type="button" onClick={() => setParams(tab === "workflow" ? {} : { tab })} className={`-mb-px border-b-2 px-1 py-3 text-sm font-semibold ${activeTab === tab ? "border-violet-600 text-violet-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{t(tab === "workflow" ? "projectSettings.workflow" : "app.team")}</button>)}
      </nav>
      {activeTab === "workflow" ? <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">{t("boards.workflowConfigTitle")}</h3><p className="mt-1 text-sm text-slate-500">{t("boards.workflowConfigHint")}</p>
        <button type="button" disabled={project.my_role !== "owner" && project.my_role !== "admin"} onClick={() => setConfigureWorkflow(true)} className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{t("boards.configureWorkflow")}</button>
      </section> : <div className="-mx-2 -mt-4"><TeamPage projectId={project.id} embedded /></div>}
    </div>
    {configureWorkflow && <WorkflowConfigDialog projectId={project.id} onClose={() => setConfigureWorkflow(false)} onSaved={() => undefined} />}
  </main>;
}

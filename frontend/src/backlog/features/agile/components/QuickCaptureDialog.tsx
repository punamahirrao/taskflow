import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { createTask } from "../../../../common/api/tasks";
import type { Project } from "../../../../common/entities/project";
import type { TranslationKey } from "../../../../common/entities/language";
import type { Task, TaskPriority, WorkType } from "../../../../common/entities/task";
import { useTranslation } from "../../../../common/shared/i18n/hooks/useTranslation";

const TYPES: [WorkType, TranslationKey][] = [["initiative", "backlog.typeInitiative"], ["epic", "backlog.typeEpic"], ["task", "backlog.typeTask"], ["idea", "backlog.typeIdea"], ["enhancement", "backlog.typeEnhancement"], ["bug", "backlog.typeBug"], ["spike", "backlog.typeSpike"], ["research", "backlog.typeResearch"]];
const PRIORITIES: [TaskPriority, TranslationKey][] = [["urgent", "backlog.priorityUrgent"], ["high", "backlog.priorityHigh"], ["medium", "backlog.priorityMedium"], ["low", "backlog.priorityLow"]];

interface QuickCaptureDialogProps {
  projects: Project[]; defaultProjectId: number | null; onClose: () => void; onCreated: (task: Task) => void;
}

export function QuickCaptureDialog({ projects, defaultProjectId, onClose, onCreated }: QuickCaptureDialogProps) {
  const { t } = useTranslation();
  const [projectId, setProjectId] = useState(defaultProjectId ? String(defaultProjectId) : String(projects[0]?.id ?? ""));
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [workType, setWorkType] = useState<WorkType>("task");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [tagText, setTagText] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const project = projects.find((item) => String(item.id) === projectId);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!project || !title.trim()) { setError(t("backlog.errChooseProject")); return; }
    setSaving(true);
    try {
      const created = await createTask({
        project_id: project.id,
        title: title.trim(),
        description: description.trim(),
        status: "backlog",
        work_type: workType,
        priority,
        estimate: "",
        tags: tagText.split(",").map((tag) => tag.trim()).filter(Boolean),
        rank: 0,
        blocked: false,
        ready_for_sprint: false,
        assignee: null,
        sprint: null,
        parent: null,
      });
      onCreated(created);
      onClose();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("backlog.errCapture"));
    } finally { setSaving(false); }
  }

  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={(event) => { if (event.target === event.currentTarget && !saving) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="capture-title" className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl">
      <header className="mb-5 flex items-start justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-600">{t("backlog.ideaEngine")}</p><h2 id="capture-title" className="mt-1 text-xl font-semibold text-slate-900">{t("backlog.captureTitle")}</h2><p className="mt-1 text-sm text-slate-500">{t("backlog.captureHint")}</p></div><button type="button" aria-label={t("backlog.close")} onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={18} /></button></header>
      <form onSubmit={(event) => void submit(event)} className="space-y-4">
        <label className="block text-sm font-medium text-slate-700">{t("backlog.titleField")}<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder={t("backlog.titlePlaceholder")} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-violet-300" /></label>
        <label className="block text-sm font-medium text-slate-700">{t("backlog.description")}<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={3} placeholder={t("backlog.descriptionPlaceholder")} className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:ring-2 focus:ring-violet-300" /></label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">{t("backlog.project")}<select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5">{projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">{t("backlog.workType")}<select value={workType} onChange={(event) => setWorkType(event.target.value as WorkType)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5">{TYPES.map(([type, labelKey]) => <option key={type} value={type}>{t(labelKey)}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">{t("backlog.priority")}<select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5">{PRIORITIES.map(([value, labelKey]) => <option key={value} value={value}>{t(labelKey)}</option>)}</select></label>
          <label className="text-sm font-medium text-slate-700">{t("backlog.tags")}<span className="mt-1.5 flex rounded-lg border border-slate-200 px-3 py-2"><input value={tagText} onChange={(event) => setTagText(event.target.value)} placeholder={t("backlog.tagsPlaceholder")} className="w-full outline-none" /></span></label>
        </div>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <footer className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">{t("backlog.cancel")}</button><button disabled={saving || !projects.length} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">{saving ? t("backlog.capturing") : t("backlog.addToBacklog")}</button></footer>
      </form>
    </section>
  </div>;
}

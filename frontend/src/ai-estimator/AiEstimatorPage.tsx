import "./ai-estimator.css";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BrainCircuit, Check, CheckCircle2, ChevronDown, Circle, FileText, LoaderCircle, Sparkles, Upload, ListChecks, WandSparkles, Plus, Trash2 } from "lucide-react";
import { deleteDocument, getDocumentLibrary, uploadDocument } from "../common/api/documents";
import type { WorkspaceDocument } from "../common/entities/document";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { getEstimationRun, retryEstimation, startEstimation } from "./api/estimator";
import type { Epic, EpicStory, EstimationRun, MacroStory, PipelineStep } from "./entities/estimator";
import { getStoredUser } from "../common/store/auth";
import type { User } from "../common/entities/user";
import type { TranslationKey } from "../common/entities/language";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { translate } from "../common/shared/i18n/translate";

const PIPELINE_STEPS: PipelineStep[] = [
  { titleKey: "aiEstimator.stepParsing", detailKey: "aiEstimator.stepParsingDetail" },
  { titleKey: "aiEstimator.stepExtracting", detailKey: "aiEstimator.stepExtractingDetail" },
  { titleKey: "aiEstimator.stepGrouping", detailKey: "aiEstimator.stepGroupingDetail" },
  { titleKey: "aiEstimator.stepEstimating", detailKey: "aiEstimator.stepEstimatingDetail" },
];

const ESTIMATOR_STEP_LABELS: TranslationKey[] = ["aiEstimator.stepUpload", "aiEstimator.stepRun"];

const INITIAL_MACRO_STORIES = [
  {
    id: "MS-01",
    title: "Account and access management",
    description: "Users can register, sign in, and manage secure access to the workspace.",
    points: 13,
  },
  {
    id: "MS-02",
    title: "Project and team collaboration",
    description: "Teams can create projects, manage membership, and coordinate their work.",
    points: 21,
  },
  {
    id: "MS-03",
    title: "Backlog, boards, and sprint planning",
    description: "Teams can organize work, track progress on boards, and plan sprint delivery.",
    points: 34,
  },
  {
    id: "MS-04",
    title: "Reporting and progress visibility",
    description: "Team members can review project status, delivery progress, and key summaries.",
    points: 13,
  },
];

const INITIAL_EPICS = [
  { id: "EP-01", title: "Identity and account access", description: "Registration, sign-in, and profile access.", stories: [{ id: "US-101", title: "Register with an email address", points: 3 }, { id: "US-102", title: "Sign in to the workspace", points: 5 }, { id: "US-103", title: "Manage account profile", points: 3 }] },
  { id: "EP-02", title: "Project collaboration", description: "Project setup, team membership, and shared planning.", stories: [{ id: "US-201", title: "Create and configure a project", points: 5 }, { id: "US-202", title: "Invite project members", points: 5 }, { id: "US-203", title: "Manage member roles", points: 3 }, { id: "US-204", title: "View project workspace", points: 5 }] },
  { id: "EP-03", title: "Work and sprint management", description: "Backlog, board workflows, and sprint planning.", stories: [{ id: "US-301", title: "Create and prioritize backlog items", points: 8 }, { id: "US-302", title: "Organize work on a board", points: 8 }, { id: "US-303", title: "Plan a sprint", points: 5 }, { id: "US-304", title: "Track sprint progress", points: 8 }, { id: "US-305", title: "Complete and review a sprint", points: 5 }] },
  { id: "EP-04", title: "Project reporting", description: "Status summaries and progress visibility.", stories: [{ id: "US-401", title: "View project progress summary", points: 5 }, { id: "US-402", title: "Review completed and outstanding work", points: 3 }, { id: "US-403", title: "Filter reports by project", points: 5 }] },
];

export default function AiEstimatorPage() {
  const { t } = useTranslation();
  const { projects, selectedId } = useProjectContext();
  const project = projects.find((item) => item.id === selectedId);
  const user = getStoredUser<User>();
  const [documents, setDocuments] = useState<WorkspaceDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"upload" | "pipeline" | "results" | "deep-analysis">("upload");
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [expandedEpics, setExpandedEpics] = useState<string[]>(["EP-01"]);
  const [confirmation, setConfirmation] = useState("");
  const [macroStories, setMacroStories] = useState<MacroStory[]>(INITIAL_MACRO_STORIES);
  const [epics, setEpics] = useState<Epic[]>(INITIAL_EPICS);
  const [estimationRun, setEstimationRun] = useState<EstimationRun | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null);

  useEffect(() => {
    let current = true;
    if (!project) { setDocuments([]); setSelectedDocumentId(null); return; }
    void getDocumentLibrary(project.id, null).then((result) => { if (current) setDocuments(result.documents); }).catch((cause) => { if (current) setError(cause instanceof Error ? cause.message : translate("aiEstimator.loadDocumentsFailed")); });
    return () => { current = false; };
  }, [project?.id]);

  useEffect(() => {
    if (step !== "pipeline" || !estimationRun || ["ready_for_review", "failed", "cancelled"].includes(estimationRun.status)) return;
    const timer = window.setInterval(() => {
      void getEstimationRun(estimationRun.id).then(setEstimationRun).catch((cause) => setError(cause instanceof Error ? cause.message : translate("aiEstimator.checkProgressFailed")));
    }, 1200);
    return () => window.clearInterval(timer);
  }, [step, estimationRun]);

  useEffect(() => {
    if (estimationRun?.status !== "ready_for_review") return;
    const stories = estimationRun.result.macro_stories;
    if (stories?.length) {
      setMacroStories(stories.map((story, index) => ({
        id: story.id || `MS-${String(index + 1).padStart(2, "0")}`,
        title: story.title,
        description: story.description,
        points: story.story_points,
      })));
    }
  }, [estimationRun]);

  async function handleUpload(file: File | undefined) {
    if (!file || !project) return;
    setBusy(true); setError(""); setSuccess("");
    try {
      const saved = await uploadDocument(file, project.id, null);
      setDocuments((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setSelectedDocumentId(saved.id);
      setSuccess(t("aiEstimator.uploaded", { name: saved.name, project: project.name }));
    } catch (cause) { setError(cause instanceof Error ? cause.message : t("aiEstimator.uploadFailed")); }
    finally { setBusy(false); }
  }

  async function handleDeleteDocument(document: WorkspaceDocument) {
    if (!window.confirm(t("aiEstimator.confirmDelete", { name: document.name }))) return;
    setDeletingDocumentId(document.id);
    setError("");
    setSuccess("");
    try {
      await deleteDocument(document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      setSelectedDocumentId((current) => current === document.id ? null : current);
      setSuccess(t("aiEstimator.deleted", { name: document.name }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("aiEstimator.deleteFailed"));
    } finally {
      setDeletingDocumentId(null);
    }
  }

  const selectedDocument = documents.find((document) => document.id === selectedDocumentId);
  const completedStages = estimationRun ? PIPELINE_STEPS.filter((_, index) => estimationRun.stages[["parsing", "extracting", "grouping", "estimating"][index]] === "complete").length : pipelineProgress;
  const isComplete = estimationRun?.status === "ready_for_review";
  const totalStoryPoints = macroStories.reduce((total, story) => total + story.points, 0);
  const finalEstimation = epics.reduce((sum, epic) => sum + epic.stories.reduce((epicSum, story) => epicSum + story.points, 0), 0);
  const detailedStoryCount = epics.reduce((sum, epic) => sum + epic.stories.length, 0);

  async function startPipeline() {
    if (!selectedDocument || !project) return;
    setPipelineProgress(0);
    setError("");
    setConfirmation("");
    try {
      const run = await startEstimation(project.id, selectedDocument.id, crypto.randomUUID());
      setEstimationRun(run);
      setStep("pipeline");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("aiEstimator.startFailed"));
    }
  }

  async function retryPipeline() {
    if (!estimationRun) return;
    setError("");
    try {
      setEstimationRun(await retryEstimation(estimationRun.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("aiEstimator.retryFailed"));
    }
  }

  function addMacroStories() {
    setConfirmation(t("aiEstimator.macroStoriesCreated", { project: project?.name ?? t("aiEstimator.theProject") }));
  }

  function addDetailedStories() {
    setConfirmation(t("aiEstimator.epicsCreated", { count: detailedStoryCount, project: project?.name ?? t("aiEstimator.theProject") }));
  }

  function toggleEpic(epicId: string) {
    setExpandedEpics((current) => current.includes(epicId) ? current.filter((id) => id !== epicId) : [...current, epicId]);
  }

  function addMacroStory() {
    const id = `MS-${String(macroStories.length + 1).padStart(2, "0")}`;
    setMacroStories((current) => [...current, { id, title: t("aiEstimator.newMacroStory"), description: t("aiEstimator.newMacroStoryDescription"), points: 5 }]);
    setConfirmation(t("aiEstimator.macroStoryAdded"));
  }

  function updateMacroStory(id: string, changes: Partial<MacroStory>) {
    setMacroStories((current) => current.map((story) => story.id === id ? { ...story, ...changes } : story));
  }

  function deleteMacroStory(id: string) {
    setMacroStories((current) => current.filter((story) => story.id !== id));
  }

  function addEpicStory(epicId: string) {
    setEpics((current) => current.map((epic) => {
      if (epic.id !== epicId) return epic;
      const id = `US-${epicId.slice(-2)}${String(epic.stories.length + 1).padStart(2, "0")}`;
      return { ...epic, stories: [...epic.stories, { id, title: t("aiEstimator.newUserStory"), points: 3 }] };
    }));
    setExpandedEpics((current) => current.includes(epicId) ? current : [...current, epicId]);
    setConfirmation(t("aiEstimator.userStoryAdded"));
  }

  function updateEpic(epicId: string, changes: Partial<Pick<Epic, "title" | "description">>) {
    setEpics((current) => current.map((epic) => epic.id === epicId ? { ...epic, ...changes } : epic));
  }

  function updateEpicStory(epicId: string, storyId: string, changes: Partial<EpicStory>) {
    setEpics((current) => current.map((epic) => epic.id === epicId ? { ...epic, stories: epic.stories.map((story) => story.id === storyId ? { ...story, ...changes } : story) } : epic));
  }

  function deleteEpic(epicId: string) {
    setEpics((current) => current.filter((epic) => epic.id !== epicId));
    setExpandedEpics((current) => current.filter((id) => id !== epicId));
  }

  function deleteEpicStory(epicId: string, storyId: string) {
    setEpics((current) => current.map((epic) => epic.id === epicId ? { ...epic, stories: epic.stories.filter((story) => story.id !== storyId) } : epic));
  }

  return <main data-testid="page-ai-estimator" className="min-h-screen bg-slate-50 p-5 md:p-8"><div className="mx-auto max-w-5xl">
    <header className="mb-7 flex items-start gap-4"><span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white"><BrainCircuit size={24} /></span><div><p className="text-xs font-bold uppercase tracking-[.18em] text-indigo-600">{t("aiEstimator.planningAssistant")}</p><h1 className="mt-1 text-2xl font-bold text-slate-900">{t("app.aiEstimator")}</h1><p className="mt-1 text-sm text-slate-500">{t("aiEstimator.subtitle")}</p></div></header>

    <div className="mb-6 grid grid-cols-2 gap-3" aria-label={t("aiEstimator.stepsAria")}>
      {ESTIMATOR_STEP_LABELS.map((label, index) => {
        const active = (step === "upload" && index === 0) || (step !== "upload" && index === 1);
        const done = step !== "upload" && index === 0;
        return <div key={label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${active ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white"}`}><span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${active ? "bg-indigo-600 text-white" : done ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{done ? <Check size={15} /> : index + 1}</span><span className={`text-sm font-semibold ${active ? "text-indigo-900" : "text-slate-600"}`}>{t(label)}</span></div>;
      })}
    </div>

    {step === "upload" ? <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-5"><h2 className="font-semibold text-slate-900">{t("aiEstimator.chooseDocument")}</h2><p className="mt-1 text-sm text-slate-500">{t("aiEstimator.chooseDocumentHint")}</p></div>
      <label className={`group flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 px-6 py-8 text-center transition hover:border-indigo-400 hover:bg-indigo-50 ${!project || busy ? "pointer-events-none opacity-50" : ""}`}>
        <span className="grid size-12 place-items-center rounded-xl bg-white text-indigo-600 shadow-sm">{busy ? <LoaderCircle className="animate-spin" size={22} /> : <Upload size={22} />}</span>
        <span className="mt-3 text-sm font-semibold text-slate-800">{busy ? t("aiEstimator.uploading") : t("aiEstimator.clickToUpload")}</span>
        <span className="mt-1 text-xs text-slate-500">{t("aiEstimator.fileTypes")}</span>
        <input type="file" accept=".pdf,.doc,.docx,.txt" className="sr-only" disabled={!project || busy} onChange={(event) => { void handleUpload(event.target.files?.[0]); event.currentTarget.value = ""; }} />
      </label>
      {!project && <p className="mt-3 text-sm text-amber-700">{t("aiEstimator.selectProjectBeforeUpload")}</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {success && <p role="status" className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700"><CheckCircle2 size={16} />{success}</p>}
      <div className="mt-7"><div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-semibold text-slate-800">{t("aiEstimator.chooseFromDocuments")}</h3><span className="text-xs text-slate-400">{t("aiEstimator.filesCount", { count: documents.length })}</span></div>
        <div className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">{documents.map((document) => { const canDelete = document.owner === user?.id || project?.my_role === "owner" || project?.my_role === "admin"; return <div key={document.id} className={`flex items-center gap-3 p-4 transition ${selectedDocumentId === document.id ? "bg-indigo-50" : "hover:bg-slate-50"}`}><input type="radio" aria-label={t("aiEstimator.selectDocument", { name: document.name })} name="estimator-document" checked={selectedDocumentId === document.id} onChange={() => setSelectedDocumentId(document.id)} className="accent-indigo-600" /><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-indigo-500"><FileText size={18} /></span><span className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{document.name}</span><span className="shrink-0 text-xs text-slate-400">{t("aiEstimator.fileSize", { size: (document.size / 1024).toFixed(0) })}</span>{canDelete && <button type="button" onClick={() => void handleDeleteDocument(document)} disabled={deletingDocumentId === document.id} title={t("aiEstimator.deleteDocument", { name: document.name })} aria-label={t("aiEstimator.deleteDocument", { name: document.name })} className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:cursor-wait disabled:opacity-50">{deletingDocumentId === document.id ? <LoaderCircle size={16} className="animate-spin" /> : <Trash2 size={16} />}</button>}</div>; })}{project && documents.length === 0 && <p className="p-6 text-center text-sm text-slate-500">{t("aiEstimator.noDocuments")}</p>}{!project && <p className="p-6 text-center text-sm text-slate-500">{t("aiEstimator.selectProjectToSeeDocuments")}</p>}</div>
      </div>
      <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-5"><p className="truncate pr-3 text-sm text-slate-500">{selectedDocument ? <>{t("aiEstimator.selected")} <span className="font-medium text-slate-800">{selectedDocument.name}</span></> : t("aiEstimator.noFileSelected")}</p><button type="button" onClick={startPipeline} disabled={!selectedDocument} className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300">{t("aiEstimator.next")}<ArrowRight size={16} /></button></div>
    </section> : step === "pipeline" ? <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <button type="button" onClick={() => setStep("upload")} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft size={16} />{t("aiEstimator.backToDocument")}</button>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">{t("aiEstimator.pipelineEyebrow")}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{t("aiEstimator.processing")}</h2><p className="mt-1 text-sm text-slate-500">{project?.name} · {selectedDocument?.name}</p></div><span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">{isComplete ? <CheckCircle2 size={14} /> : <LoaderCircle className="animate-spin" size={14} />}{isComplete ? t("aiEstimator.pipelineComplete") : t("aiEstimator.working")}</span></div>
      <div className="mb-7 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm"><FileText size={19} /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-slate-800">{selectedDocument?.name}</p><p className="text-xs text-slate-500">{selectedDocument ? `${t("aiEstimator.fileSize", { size: (selectedDocument.size / 1024).toFixed(0) })} · ` : ""}{t("aiEstimator.requirementsSource")}</p></div><Sparkles size={18} className="text-indigo-400" /></div></div>
      <ol className="relative ml-5 space-y-0 border-l border-slate-200">{PIPELINE_STEPS.map((item, index) => { const stageStatus = estimationRun?.stages[["parsing", "extracting", "grouping", "estimating"][index]]; const done = estimationRun ? stageStatus === "complete" : false; const active = estimationRun ? stageStatus === "running" || (stageStatus === "queued" && index === completedStages) : false; return <li key={item.titleKey} className="relative pb-7 pl-8 last:pb-0"><span className={`absolute -left-[17px] top-0 grid size-8 place-items-center rounded-full border-4 border-white ${done ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>{done ? <Check size={14} /> : active ? <LoaderCircle className="animate-spin" size={14} /> : <Circle size={12} />}</span><p className={`text-sm font-semibold ${done ? "text-emerald-700" : active ? "text-indigo-700" : "text-slate-400"}`}>{t(item.titleKey)}</p><p className="mt-1 text-xs text-slate-500">{done ? t("aiEstimator.stepDetailComplete", { detail: t(item.detailKey) }) : t(item.detailKey)}</p></li>; })}</ol>
      {estimationRun?.status === "failed" && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-rose-50 px-4 py-3"><p role="alert" className="text-sm text-rose-700">{estimationRun.error || t("aiEstimator.estimationFailed")}</p><button type="button" onClick={() => void retryPipeline()} className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100">{t("aiEstimator.retry")}</button></div>}
      {isComplete && <div className="mt-8 flex justify-end border-t border-slate-100 pt-5"><button type="button" onClick={() => setStep("results")} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700">{t("aiEstimator.next")}<ArrowRight size={16} /></button></div>}
    </section> : step === "results" ? <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <button type="button" onClick={() => setStep("pipeline")} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft size={16} />{t("aiEstimator.backToPipeline")}</button>
      <div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">{t("aiEstimator.resultsEyebrow")}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{t("aiEstimator.macroStories")}</h2><p className="mt-1 text-sm text-slate-500">{t("aiEstimator.scopeInferred", { name: selectedDocument?.name ?? "" })}</p></div>
      <div className="mb-6 rounded-2xl bg-indigo-600 p-6 text-white"><p className="text-sm font-medium text-indigo-100">{t("aiEstimator.totalStoryPoints")}</p><div className="mt-2 flex items-end gap-2"><span className="text-5xl font-bold tracking-tight">{totalStoryPoints}</span><span className="pb-1 text-sm text-indigo-100">{t("aiEstimator.points")}</span></div><p className="mt-3 text-xs text-indigo-100">{t("aiEstimator.estimatedAcross", { count: macroStories.length })}</p></div>
      {confirmation && <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><CheckCircle2 size={17} />{confirmation}</p>}
      <div className="space-y-3">{macroStories.map((story) => <article key={story.id} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><ListChecks size={19} /></span><div className="min-w-0 flex-1"><p className="text-xs font-semibold text-indigo-600">{story.id}</p><input aria-label={t("aiEstimator.requirementTitle", { id: story.id })} value={story.title} onChange={(event) => updateMacroStory(story.id, { title: event.target.value })} className="mt-1 w-full rounded-md border border-transparent bg-transparent px-1 py-1 font-semibold text-slate-900 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none" /><textarea aria-label={t("aiEstimator.requirementDescription", { id: story.id })} value={story.description} onChange={(event) => updateMacroStory(story.id, { description: event.target.value })} rows={2} className="mt-1 w-full resize-y rounded-md border border-transparent bg-transparent px-1 py-1 text-sm leading-6 text-slate-600 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none" /></div><div className="flex shrink-0 flex-col items-end gap-2"><label className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700"><input aria-label={t("aiEstimator.storyPoints", { id: story.id })} type="number" min="0" value={story.points} onChange={(event) => updateMacroStory(story.id, { points: Math.max(0, Number(event.target.value)) })} className="w-10 bg-transparent text-right outline-none" />{t("aiEstimator.pts")}</label><button type="button" onClick={() => deleteMacroStory(story.id)} aria-label={t("aiEstimator.deleteItem", { id: story.id })} title={t("aiEstimator.deleteRequirement")} className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button></div></article>)}</div>
      <div className="mt-4"><button type="button" onClick={addMacroStory} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"><Plus size={16} />{t("aiEstimator.quickAddStory")}</button></div>
      <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={() => { setStep("deep-analysis"); setConfirmation(""); }} className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"><WandSparkles size={16} />{t("aiEstimator.deepAnalysis")}</button><button type="button" onClick={addMacroStories} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"><CheckCircle2 size={16} />{t("aiEstimator.addStoriesToProject")}</button></div>
    </section> : <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <button type="button" onClick={() => { setStep("results"); setConfirmation(""); }} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"><ArrowLeft size={16} />{t("aiEstimator.backToMacroStories")}</button>
      <div className="mb-6"><p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">{t("aiEstimator.deepAnalysis")}</p><h2 className="mt-1 text-xl font-bold text-slate-900">{t("aiEstimator.epicsAndStories")}</h2><p className="mt-1 text-sm text-slate-500">{t("aiEstimator.deepAnalysisHint")}</p></div>
      <div className="mb-6 rounded-2xl bg-indigo-600 p-6 text-white"><p className="text-sm font-medium text-indigo-100">{t("aiEstimator.finalEstimation")}</p><div className="mt-2 flex items-end gap-2"><span className="text-5xl font-bold tracking-tight">{finalEstimation}</span><span className="pb-1 text-sm text-indigo-100">{t("aiEstimator.storyPointsUnit")}</span></div><p className="mt-3 text-xs text-indigo-100">{t("aiEstimator.acrossEpics", { epics: epics.length, stories: detailedStoryCount })}</p></div>
      {confirmation && <p role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"><CheckCircle2 size={17} />{confirmation}</p>}
      <div className="space-y-3">{epics.map((epic) => { const expanded = expandedEpics.includes(epic.id); const epicPoints = epic.stories.reduce((sum, story) => sum + story.points, 0); return <article key={epic.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center gap-2 p-4 sm:p-5"><button type="button" aria-expanded={expanded} onClick={() => toggleEpic(epic.id)} className="flex min-w-0 flex-1 items-center gap-4 text-left"><span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><ListChecks size={19} /></span><span className="min-w-0 flex-1"><span className="block text-xs font-semibold text-indigo-600">{t("aiEstimator.epicBadge", { id: epic.id })}</span><input aria-label={t("aiEstimator.epicTitle", { id: epic.id })} value={epic.title} onClick={(event) => event.stopPropagation()} onChange={(event) => updateEpic(epic.id, { title: event.target.value })} className="mt-1 block w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-semibold text-slate-900 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none" /><input aria-label={t("aiEstimator.epicDescription", { id: epic.id })} value={epic.description} onClick={(event) => event.stopPropagation()} onChange={(event) => updateEpic(epic.id, { description: event.target.value })} className="mt-1 block w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm text-slate-500 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none" /></span></button><button type="button" onClick={() => addEpicStory(epic.id)} aria-label={t("aiEstimator.addStoryTo", { title: epic.title })} title={t("aiEstimator.quickAddToEpic")} className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"><Plus size={17} /></button><label className="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700"><input aria-label={t("aiEstimator.epicStoryPoints", { id: epic.id })} type="number" min="0" value={epicPoints} onChange={(event) => { const desired = Math.max(0, Number(event.target.value)); const current = epic.stories.reduce((sum, story) => sum + story.points, 0); const delta = desired - current; if (epic.stories.length) updateEpicStory(epic.id, epic.stories[0].id, { points: Math.max(0, epic.stories[0].points + delta) }); }} className="w-12 bg-transparent text-right outline-none" />{t("aiEstimator.pts")}</label><button type="button" onClick={() => deleteEpic(epic.id)} aria-label={t("aiEstimator.deleteEpic", { id: epic.id })} title={t("aiEstimator.deleteEpicAndStories")} className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button><button type="button" aria-label={expanded ? t("aiEstimator.collapseEpic") : t("aiEstimator.expandEpic")} onClick={() => toggleEpic(epic.id)} className="rounded-md p-2 text-slate-400 hover:bg-slate-100"><ChevronDown size={18} className={`transition-transform ${expanded ? "rotate-180" : ""}`} /></button></div>{expanded && <div className="space-y-2 border-t border-slate-100 bg-slate-50 p-4 sm:pl-[4.5rem]">{epic.stories.map((story) => <div key={story.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"><span className="shrink-0 text-xs font-semibold text-slate-400">{story.id}</span><input aria-label={t("aiEstimator.storyTitle", { id: story.id })} value={story.title} onChange={(event) => updateEpicStory(epic.id, story.id, { title: event.target.value })} className="min-w-0 flex-1 rounded border border-transparent px-2 py-1 text-sm font-medium text-slate-700 hover:border-slate-200 focus:border-indigo-300 focus:outline-none" /><label className="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"><input aria-label={t("aiEstimator.storyPoints", { id: story.id })} type="number" min="0" value={story.points} onChange={(event) => updateEpicStory(epic.id, story.id, { points: Math.max(0, Number(event.target.value)) })} className="w-9 bg-transparent text-right outline-none" />{t("aiEstimator.pts")}</label><button type="button" onClick={() => deleteEpicStory(epic.id, story.id)} aria-label={t("aiEstimator.deleteStory", { id: story.id })} className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={14} /></button></div>)}</div>}</article>; })}</div>
      <div className="mt-7 flex justify-end border-t border-slate-100 pt-5"><button type="button" onClick={addDetailedStories} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"><CheckCircle2 size={16} />{t("aiEstimator.createInProject")}</button></div>
    </section>}
  </div></main>;
}

import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronDown,
  Circle,
  FileText,
  LoaderCircle,
  Sparkles,
  ListChecks,
  WandSparkles,
  Plus,
  Trash2,
} from "lucide-react";
import { deleteDocument, getDocumentLibrary, uploadDocument } from "../documents/api/documents";
import type { OrganizationDocument } from "../common/entities/document";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import {
  getEstimationRun,
  importEstimationStories,
  retryEstimation,
  startEstimation,
} from "./api/estimator";
import type { Epic, EpicStory, EstimationRun, MacroStory } from "./entities/estimator";
import { useAppSelector } from "../common/store";
import { useTranslation } from "../common/shared/i18n/hooks/useTranslation";
import { translate } from "../common/shared/i18n/translate";
import { EstimatorPageHeader } from "./components/EstimatorPageHeader";
import { EstimatorStepNavigation } from "./components/EstimatorStepNavigation";
import { ESTIMATOR_STEP_LABELS, PIPELINE_STEPS } from "./features/estimatorData";
import { DocumentSelectionSection } from "./components/DocumentSelectionSection";
import {
  EstimatorNumberField,
  EstimatorTextAreaField,
  EstimatorTextField,
} from "./components/EstimatorFields";
import {
  EstimatorPageContent,
  EstimatorPageSurface,
  EstimatorPanel,
} from "./AiEstimatorPage.styles";

export default function EstimatorWorkspace() {
  const { t } = useTranslation();
  const { projects, selectedId } = useProjectContext();
  const project = projects.find((item) => item.id === selectedId);
  const user = useAppSelector((state) => state.session.user);
  const [documents, setDocuments] = useState<OrganizationDocument[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState<"upload" | "pipeline" | "results" | "deep-analysis">("upload");
  const [pipelineProgress, setPipelineProgress] = useState(0);
  const [expandedEpics, setExpandedEpics] = useState<string[]>(["EP-01"]);
  const [confirmation, setConfirmation] = useState("");
  const [macroStories, setMacroStories] = useState<MacroStory[]>([]);
  const [epics, setEpics] = useState<Epic[]>([]);
  const [estimationRun, setEstimationRun] = useState<EstimationRun | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null);

  const projectId = project?.id;
  const applyRun = useCallback((run: EstimationRun) => {
    setEstimationRun(run);
    if (run.status === "ready_for_review") {
      const stories = (run.result.macro_stories ?? []).map((story, index) => ({
        id: story.id || `MS-${index + 1}`,
        title: story.title,
        description: story.description,
        points: story.story_points,
      }));
      setMacroStories(stories);
      setEpics(
        stories.map((story) => ({
          id: story.id,
          title: story.title,
          description: story.description,
          stories: [{ id: `${story.id}-1`, title: story.title, points: story.points }],
        })),
      );
    }
  }, []);
  useEffect(() => {
    let current = true;
    if (!projectId) return;
    void getDocumentLibrary(projectId, null)
      .then((result) => {
        if (current) setDocuments(result.documents);
      })
      .catch((cause) => {
        if (current)
          setError(
            cause instanceof Error ? cause.message : translate("aiEstimator.loadDocumentsFailed"),
          );
      });
    return () => {
      current = false;
    };
  }, [projectId]);

  useEffect(() => {
    if (
      step !== "pipeline" ||
      !estimationRun ||
      ["ready_for_review", "failed", "cancelled"].includes(estimationRun.status)
    )
      return;
    let active = true;
    const timer = window.setTimeout(() => {
      void getEstimationRun(estimationRun.id)
        .then((run) => {
          if (active) applyRun(run);
        })
        .catch((cause) => {
          if (active) {
            setError(
              cause instanceof Error ? cause.message : translate("aiEstimator.checkProgressFailed"),
            );
            setStep("upload");
          }
        });
    }, 1500);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [step, estimationRun, applyRun]);

  async function handleUpload(file: File | undefined) {
    if (!file || !project) return;
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const saved = await uploadDocument(file, project.id, null);
      setDocuments((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
      setSelectedDocumentId(saved.id);
      setSuccess(t("aiEstimator.uploaded", { name: saved.name, project: project.name }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("aiEstimator.uploadFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDeleteDocument(document: OrganizationDocument) {
    if (!window.confirm(t("aiEstimator.confirmDelete", { name: document.name }))) return;
    setDeletingDocumentId(document.id);
    setError("");
    setSuccess("");
    try {
      await deleteDocument(document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      setSelectedDocumentId((current) => (current === document.id ? null : current));
      setSuccess(t("aiEstimator.deleted", { name: document.name }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("aiEstimator.deleteFailed"));
    } finally {
      setDeletingDocumentId(null);
    }
  }

  const selectedDocument = documents.find((document) => document.id === selectedDocumentId);
  const completedStages = estimationRun
    ? PIPELINE_STEPS.filter(
        (_, index) =>
          estimationRun.stages[["parsing", "extracting", "grouping", "estimating"][index]] ===
          "complete",
      ).length
    : pipelineProgress;
  const isComplete = estimationRun?.status === "ready_for_review";
  const totalStoryPoints = macroStories.reduce((total, story) => total + story.points, 0);
  const finalEstimation = epics.reduce(
    (sum, epic) => sum + epic.stories.reduce((epicSum, story) => epicSum + story.points, 0),
    0,
  );
  const detailedStoryCount = epics.reduce((sum, epic) => sum + epic.stories.length, 0);

  async function startPipeline() {
    if (!selectedDocument || !project) return;
    setPipelineProgress(0);
    setError("");
    setConfirmation("");
    try {
      const run = await startEstimation(project.id, selectedDocument.id, crypto.randomUUID());
      applyRun(run);
      setStep("pipeline");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("aiEstimator.startFailed"));
    }
  }

  async function retryPipeline() {
    if (!estimationRun) return;
    setError("");
    try {
      applyRun(await retryEstimation(estimationRun.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("aiEstimator.retryFailed"));
    }
  }

  async function importStories(detailed: boolean) {
    if (!estimationRun || !isComplete || busy) return;
    setBusy(true);
    setError("");
    setConfirmation("");
    try {
      const result = await importEstimationStories(
        estimationRun.id,
        detailed ? { epics } : { stories: macroStories },
      );
      setConfirmation(
        result.already_created
          ? "This estimate was already imported. No duplicate work items were created."
          : `Saved ${result.created_count} work items to ${project?.name}.`,
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Work items could not be created.");
    } finally {
      setBusy(false);
    }
  }
  function addMacroStories() {
    void importStories(false);
  }
  function addDetailedStories() {
    void importStories(true);
  }

  function toggleEpic(epicId: string) {
    setExpandedEpics((current) =>
      current.includes(epicId) ? current.filter((id) => id !== epicId) : [...current, epicId],
    );
  }

  function addMacroStory() {
    const id = `MS-${String(macroStories.length + 1).padStart(2, "0")}`;
    setMacroStories((current) => [
      ...current,
      {
        id,
        title: t("aiEstimator.newMacroStory"),
        description: t("aiEstimator.newMacroStoryDescription"),
        points: 5,
      },
    ]);
    setConfirmation("Added to the proposal. Save to the project to create work items.");
  }

  function updateMacroStory(id: string, changes: Partial<MacroStory>) {
    setMacroStories((current) =>
      current.map((story) => (story.id === id ? { ...story, ...changes } : story)),
    );
  }

  function deleteMacroStory(id: string) {
    setMacroStories((current) => current.filter((story) => story.id !== id));
  }

  function addEpicStory(epicId: string) {
    setEpics((current) =>
      current.map((epic) => {
        if (epic.id !== epicId) return epic;
        const id = `US-${epicId.slice(-2)}${String(epic.stories.length + 1).padStart(2, "0")}`;
        return {
          ...epic,
          stories: [...epic.stories, { id, title: t("aiEstimator.newUserStory"), points: 3 }],
        };
      }),
    );
    setExpandedEpics((current) => (current.includes(epicId) ? current : [...current, epicId]));
    setConfirmation("Added to the proposal. Save to the project to create work items.");
  }

  function updateEpic(epicId: string, changes: Partial<Pick<Epic, "title" | "description">>) {
    setEpics((current) =>
      current.map((epic) => (epic.id === epicId ? { ...epic, ...changes } : epic)),
    );
  }

  function updateEpicStory(epicId: string, storyId: string, changes: Partial<EpicStory>) {
    setEpics((current) =>
      current.map((epic) =>
        epic.id === epicId
          ? {
              ...epic,
              stories: epic.stories.map((story) =>
                story.id === storyId ? { ...story, ...changes } : story,
              ),
            }
          : epic,
      ),
    );
  }

  function deleteEpic(epicId: string) {
    setEpics((current) => current.filter((epic) => epic.id !== epicId));
    setExpandedEpics((current) => current.filter((id) => id !== epicId));
  }

  function deleteEpicStory(epicId: string, storyId: string) {
    setEpics((current) =>
      current.map((epic) =>
        epic.id === epicId
          ? { ...epic, stories: epic.stories.filter((story) => story.id !== storyId) }
          : epic,
      ),
    );
  }

  return (
    <EstimatorPageSurface data-testid="page-ai-estimator">
      <EstimatorPageContent>
        <EstimatorPageHeader />
        <EstimatorStepNavigation labels={ESTIMATOR_STEP_LABELS} step={step} />

        {step === "upload" ? (
          <DocumentSelectionSection
            project={project}
            userId={user?.id}
            documents={documents}
            selectedDocument={selectedDocument}
            selectedDocumentId={selectedDocumentId}
            busy={busy}
            error={error}
            success={success}
            deletingDocumentId={deletingDocumentId}
            onUpload={(file) => {
              void handleUpload(file);
            }}
            onSelectDocument={setSelectedDocumentId}
            onDeleteDocument={(document) => {
              void handleDeleteDocument(document);
            }}
            onStartPipeline={() => {
              void startPipeline();
            }}
            t={t}
          />
        ) : step === "pipeline" ? (
          <EstimatorPanel>
            <button
              type="button"
              onClick={() => setStep("upload")}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={16} />
              {t("aiEstimator.backToDocument")}
            </button>
            <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
                  {t("aiEstimator.pipelineEyebrow")}
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {t("aiEstimator.processing")}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {project?.name} · {selectedDocument?.name}
                </p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                {isComplete ? (
                  <CheckCircle2 size={14} />
                ) : (
                  <LoaderCircle className="animate-spin" size={14} />
                )}
                {isComplete ? t("aiEstimator.pipelineComplete") : t("aiEstimator.working")}
              </span>
            </div>
            <div className="mb-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-lg bg-white text-indigo-600 shadow-sm">
                  <FileText size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">
                    {selectedDocument?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedDocument
                      ? `${t("aiEstimator.fileSize", { size: (selectedDocument.size / 1024).toFixed(0) })} · `
                      : ""}
                    {t("aiEstimator.requirementsSource")}
                  </p>
                </div>
                <Sparkles size={18} className="text-indigo-400" />
              </div>
            </div>
            <ol className="relative ml-5 space-y-0 border-l border-slate-200">
              {PIPELINE_STEPS.map((item, index) => {
                const stageStatus =
                  estimationRun?.stages[["parsing", "extracting", "grouping", "estimating"][index]];
                const done = estimationRun ? stageStatus === "complete" : false;
                const active = estimationRun
                  ? stageStatus === "running" ||
                    (stageStatus === "queued" && index === completedStages)
                  : false;
                return (
                  <li key={item.titleKey} className="relative pb-7 pl-8 last:pb-0">
                    <span
                      className={`absolute -left-[17px] top-0 grid size-8 place-items-center rounded-full border-4 border-white ${done ? "bg-emerald-500 text-white" : active ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}
                    >
                      {done ? (
                        <Check size={14} />
                      ) : active ? (
                        <LoaderCircle className="animate-spin" size={14} />
                      ) : (
                        <Circle size={12} />
                      )}
                    </span>
                    <p
                      className={`text-sm font-semibold ${done ? "text-emerald-700" : active ? "text-indigo-700" : "text-slate-400"}`}
                    >
                      {t(item.titleKey)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {done
                        ? t("aiEstimator.stepDetailComplete", { detail: t(item.detailKey) })
                        : t(item.detailKey)}
                    </p>
                  </li>
                );
              })}
            </ol>
            {estimationRun?.status === "failed" && (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-rose-50 px-4 py-3">
                <p role="alert" className="text-sm text-rose-700">
                  {estimationRun.error || t("aiEstimator.estimationFailed")}
                </p>
                <button
                  type="button"
                  onClick={() => void retryPipeline()}
                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-rose-700 shadow-sm hover:bg-rose-100"
                >
                  {t("aiEstimator.retry")}
                </button>
              </div>
            )}
            {isComplete && (
              <div className="mt-8 flex justify-end border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setStep("results")}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                >
                  {t("aiEstimator.next")}
                  <ArrowRight size={16} />
                </button>
              </div>
            )}
          </EstimatorPanel>
        ) : step === "results" ? (
          <EstimatorPanel>
            <button
              type="button"
              onClick={() => setStep("pipeline")}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={16} />
              {t("aiEstimator.backToPipeline")}
            </button>
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
                {t("aiEstimator.resultsEyebrow")}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {t("aiEstimator.macroStories")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {t("aiEstimator.scopeInferred", { name: selectedDocument?.name ?? "" })}
              </p>
            </div>
            <div className="mb-6 rounded-2xl bg-indigo-600 p-6 text-white">
              <p className="text-sm font-medium text-indigo-100">
                {t("aiEstimator.totalStoryPoints")}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-bold tracking-tight">{totalStoryPoints}</span>
                <span className="pb-1 text-sm text-indigo-100">{t("aiEstimator.points")}</span>
              </div>
              <p className="mt-3 text-xs text-indigo-100">
                {t("aiEstimator.estimatedAcross", { count: macroStories.length })}
              </p>
            </div>
            {confirmation && (
              <p
                role="status"
                className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
              >
                <CheckCircle2 size={17} />
                {confirmation}
              </p>
            )}
            <div className="space-y-3">
              {macroStories.map((story) => (
                <article
                  key={story.id}
                  className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-5"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                    <ListChecks size={19} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-indigo-600">{story.id}</p>
                    <EstimatorTextField
                      id={`macro-title-${story.id}`}
                      testId={`macro-story-title-${story.id}`}
                      label={t("aiEstimator.requirementTitle", { id: story.id })}
                      value={story.title}
                      onChange={(value) => updateMacroStory(story.id, { title: value })}
                      className="mt-1 w-full rounded-md border border-transparent bg-transparent px-1 py-1 font-semibold text-slate-900 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none"
                    />
                    <EstimatorTextAreaField
                      id={`macro-description-${story.id}`}
                      testId={`macro-story-description-${story.id}`}
                      label={t("aiEstimator.requirementDescription", { id: story.id })}
                      value={story.description}
                      onChange={(value) => updateMacroStory(story.id, { description: value })}
                      rows={2}
                      className="mt-1 w-full resize-y rounded-md border border-transparent bg-transparent px-1 py-1 text-sm leading-6 text-slate-600 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none"
                    />
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <EstimatorNumberField
                      id={`macro-points-${story.id}`}
                      testId={`macro-story-points-${story.id}`}
                      label={t("aiEstimator.storyPoints", { id: story.id })}
                      value={story.points}
                      onChange={(value) => updateMacroStory(story.id, { points: value })}
                      className="w-10 bg-transparent text-right outline-none"
                      wrapperClassName="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700"
                      suffix={t("aiEstimator.pts")}
                    />
                    <button
                      type="button"
                      onClick={() => deleteMacroStory(story.id)}
                      aria-label={t("aiEstimator.deleteItem", { id: story.id })}
                      title={t("aiEstimator.deleteRequirement")}
                      className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={addMacroStory}
                className="inline-flex items-center gap-2 rounded-lg border border-dashed border-indigo-300 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                <Plus size={16} />
                {t("aiEstimator.quickAddStory")}
              </button>
            </div>
            <div className="mt-7 flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => {
                  setStep("deep-analysis");
                  setConfirmation("");
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
              >
                <WandSparkles size={16} />
                {t("aiEstimator.deepAnalysis")}
              </button>
              <button
                type="button"
                disabled={busy || !isComplete || !macroStories.length}
                onClick={addMacroStories}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <CheckCircle2 size={16} />
                {t("aiEstimator.addStoriesToProject")}
              </button>
            </div>
          </EstimatorPanel>
        ) : (
          <EstimatorPanel>
            <button
              type="button"
              onClick={() => {
                setStep("results");
                setConfirmation("");
              }}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={16} />
              {t("aiEstimator.backToMacroStories")}
            </button>
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-indigo-600">
                {t("aiEstimator.deepAnalysis")}
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-900">
                {t("aiEstimator.epicsAndStories")}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{t("aiEstimator.deepAnalysisHint")}</p>
            </div>
            <div className="mb-6 rounded-2xl bg-indigo-600 p-6 text-white">
              <p className="text-sm font-medium text-indigo-100">
                {t("aiEstimator.finalEstimation")}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <span className="text-5xl font-bold tracking-tight">{finalEstimation}</span>
                <span className="pb-1 text-sm text-indigo-100">
                  {t("aiEstimator.storyPointsUnit")}
                </span>
              </div>
              <p className="mt-3 text-xs text-indigo-100">
                {t("aiEstimator.acrossEpics", { epics: epics.length, stories: detailedStoryCount })}
              </p>
            </div>
            {confirmation && (
              <p
                role="status"
                className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
              >
                <CheckCircle2 size={17} />
                {confirmation}
              </p>
            )}
            <div className="space-y-3">
              {epics.map((epic) => {
                const expanded = expandedEpics.includes(epic.id);
                const epicPoints = epic.stories.reduce((sum, story) => sum + story.points, 0);
                return (
                  <article
                    key={epic.id}
                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                  >
                    <div className="flex items-center gap-2 p-4 sm:p-5">
                      <button
                        type="button"
                        aria-expanded={expanded}
                        onClick={() => toggleEpic(epic.id)}
                        className="flex min-w-0 flex-1 items-center gap-4 text-left"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
                          <ListChecks size={19} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-indigo-600">
                            {t("aiEstimator.epicBadge", { id: epic.id })}
                          </span>
                          <EstimatorTextField
                            id={`epic-title-${epic.id}`}
                            testId={`epic-title-${epic.id}`}
                            label={t("aiEstimator.epicTitle", { id: epic.id })}
                            value={epic.title}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(value) => updateEpic(epic.id, { title: value })}
                            className="mt-1 block w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-semibold text-slate-900 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none"
                          />
                          <EstimatorTextField
                            id={`epic-description-${epic.id}`}
                            testId={`epic-description-${epic.id}`}
                            label={t("aiEstimator.epicDescription", { id: epic.id })}
                            value={epic.description}
                            onClick={(event) => event.stopPropagation()}
                            onChange={(value) => updateEpic(epic.id, { description: value })}
                            className="mt-1 block w-full rounded border border-transparent bg-transparent px-1 py-0.5 text-sm text-slate-500 hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:outline-none"
                          />
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => addEpicStory(epic.id)}
                        aria-label={t("aiEstimator.addStoryTo", { title: epic.title })}
                        title={t("aiEstimator.quickAddToEpic")}
                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50"
                      >
                        <Plus size={17} />
                      </button>
                      <EstimatorNumberField
                        id={`epic-points-${epic.id}`}
                        testId={`epic-points-${epic.id}`}
                        label={t("aiEstimator.epicStoryPoints", { id: epic.id })}
                        value={epicPoints}
                        onChange={(desired) => {
                          const current = epic.stories.reduce(
                            (sum, story) => sum + story.points,
                            0,
                          );
                          const delta = desired - current;
                          if (epic.stories.length)
                            updateEpicStory(epic.id, epic.stories[0].id, {
                              points: Math.max(0, epic.stories[0].points + delta),
                            });
                        }}
                        className="w-12 bg-transparent text-right outline-none"
                        wrapperClassName="flex items-center gap-1 rounded-full bg-violet-50 px-2 py-1 text-xs font-bold text-violet-700"
                        suffix={t("aiEstimator.pts")}
                      />
                      <button
                        type="button"
                        onClick={() => deleteEpic(epic.id)}
                        aria-label={t("aiEstimator.deleteEpic", { id: epic.id })}
                        title={t("aiEstimator.deleteEpicAndStories")}
                        className="rounded-md p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        type="button"
                        aria-label={
                          expanded ? t("aiEstimator.collapseEpic") : t("aiEstimator.expandEpic")
                        }
                        onClick={() => toggleEpic(epic.id)}
                        className="rounded-md p-2 text-slate-400 hover:bg-slate-100"
                      >
                        <ChevronDown
                          size={18}
                          className={`transition-transform ${expanded ? "rotate-180" : ""}`}
                        />
                      </button>
                    </div>
                    {expanded && (
                      <div className="space-y-2 border-t border-slate-100 bg-slate-50 p-4 sm:pl-[4.5rem]">
                        {epic.stories.map((story) => (
                          <div
                            key={story.id}
                            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2"
                          >
                            <span className="shrink-0 text-xs font-semibold text-slate-400">
                              {story.id}
                            </span>
                            <EstimatorTextField
                              id={`user-story-title-${story.id}`}
                              testId={`user-story-title-${story.id}`}
                              label={t("aiEstimator.storyTitle", { id: story.id })}
                              value={story.title}
                              onChange={(value) =>
                                updateEpicStory(epic.id, story.id, { title: value })
                              }
                              className="min-w-0 flex-1 rounded border border-transparent px-2 py-1 text-sm font-medium text-slate-700 hover:border-slate-200 focus:border-indigo-300 focus:outline-none"
                            />
                            <EstimatorNumberField
                              id={`user-story-points-${story.id}`}
                              testId={`user-story-points-${story.id}`}
                              label={t("aiEstimator.storyPoints", { id: story.id })}
                              value={story.points}
                              onChange={(value) =>
                                updateEpicStory(epic.id, story.id, { points: value })
                              }
                              className="w-9 bg-transparent text-right outline-none"
                              wrapperClassName="flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600"
                              suffix={t("aiEstimator.pts")}
                            />
                            <button
                              type="button"
                              onClick={() => deleteEpicStory(epic.id, story.id)}
                              aria-label={t("aiEstimator.deleteStory", { id: story.id })}
                              className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                disabled={busy || !isComplete || !detailedStoryCount}
                onClick={addDetailedStories}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              >
                <CheckCircle2 size={16} />
                {t("aiEstimator.createInProject")}
              </button>
            </div>
          </EstimatorPanel>
        )}
      </EstimatorPageContent>
    </EstimatorPageSurface>
  );
}

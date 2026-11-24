import { useCallback, useEffect, useState } from "react";
import type { OrganizationDocument } from "../../../common/entities/document";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { translate } from "../../../common/shared/i18n/translate";
import { useAppSelector } from "../../../common/store";
import {
  deleteDocument,
  getDocumentLibrary,
  uploadDocument,
} from "../../../documents/api/documents";
import {
  getEstimationRun,
  importEstimationStories,
  retryEstimation,
  startEstimation,
} from "../../api/estimator";
import type { Epic, EpicStory, EstimationRun, MacroStory } from "../../entities/estimator";
import { PIPELINE_STEPS } from "../estimatorData";

export function useEstimatorWorkspaceModel() {
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

  return {
    t,
    project,
    user,
    documents,
    selectedDocumentId,
    setSelectedDocumentId,
    busy,
    error,
    success,
    step,
    setStep,
    expandedEpics,
    confirmation,
    setConfirmation,
    macroStories,
    epics,
    estimationRun,
    deletingDocumentId,
    selectedDocument,
    completedStages,
    isComplete,
    totalStoryPoints,
    finalEstimation,
    detailedStoryCount,
    handleUpload,
    handleDeleteDocument,
    startPipeline,
    retryPipeline,
    addMacroStories,
    addDetailedStories,
    toggleEpic,
    addMacroStory,
    updateMacroStory,
    deleteMacroStory,
    addEpicStory,
    updateEpic,
    updateEpicStory,
    deleteEpic,
    deleteEpicStory,
  };
}

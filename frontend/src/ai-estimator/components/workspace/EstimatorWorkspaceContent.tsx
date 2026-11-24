import { EstimatorPageContent } from "../../AiEstimatorPage.styles";
import { ESTIMATOR_STEP_LABELS } from "../../features/estimatorData";
import { EstimatorDeepAnalysis } from "../deep-analysis/EstimatorDeepAnalysis";
import { DocumentSelectionSection } from "../document-selection/DocumentSelectionSection";
import { EstimatorPageHeader } from "../header/EstimatorPageHeader";
import { EstimatorStepNavigation } from "../navigation/EstimatorStepNavigation";
import { EstimatorPipeline } from "../pipeline/EstimatorPipeline";
import { EstimatorResults } from "../results/EstimatorResults";

import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";
export function EstimatorWorkspaceContent({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  const {
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
    deletingDocumentId,
    selectedDocument,
    handleUpload,
    handleDeleteDocument,
    startPipeline,
  } = model;
  return (
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
            if (window.confirm(t("aiEstimator.confirmDelete", { name: document.name })))
              void handleDeleteDocument(document);
          }}
          onStartPipeline={() => {
            void startPipeline();
          }}
          t={t}
        />
      ) : step === "pipeline" ? (
        <EstimatorPipeline model={model} />
      ) : step === "results" ? (
        <EstimatorResults model={model} />
      ) : (
        <EstimatorDeepAnalysis model={model} />
      )}
    </EstimatorPageContent>
  );
}

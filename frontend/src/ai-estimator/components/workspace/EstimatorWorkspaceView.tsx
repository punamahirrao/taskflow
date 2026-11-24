import { EstimatorPageSurface } from "../../AiEstimatorPage.styles";

import type { useEstimatorWorkspaceModel } from "../../features/workspace/useEstimatorWorkspaceModel";
import { EstimatorWorkspaceContent } from "./EstimatorWorkspaceContent";
export function EstimatorWorkspaceView({
  model,
}: {
  model: ReturnType<typeof useEstimatorWorkspaceModel>;
}) {
  return (
    <EstimatorPageSurface data-testid="page-ai-estimator">
      <EstimatorWorkspaceContent model={model} />
    </EstimatorPageSurface>
  );
}

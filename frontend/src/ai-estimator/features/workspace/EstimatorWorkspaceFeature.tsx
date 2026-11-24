import { EstimatorWorkspaceView } from "../../components/workspace/EstimatorWorkspaceView";
import { useEstimatorWorkspaceModel } from "./useEstimatorWorkspaceModel";
export function EstimatorWorkspaceFeature() {
  const model = useEstimatorWorkspaceModel();
  return <EstimatorWorkspaceView model={model} />;
}

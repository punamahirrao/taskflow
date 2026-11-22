import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import EstimatorWorkspace from "./EstimatorWorkspace";

export default function AiEstimatorPage() {
  const { selectedId } = useProjectContext();
  return <EstimatorWorkspace key={selectedId ?? "all"} />;
}

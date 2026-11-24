import { useSearchParams } from "react-router-dom";
import { useProjectContext } from "../common/features/projects/context/useProjectContext";
import { DocumentLibraryPageFeature as DocumentLibraryPage } from "./features/library/DocumentLibraryPageFeature";
export default function DocumentsPage({ projectId }: { projectId?: number } = {}) {
  const { selectedId } = useProjectContext();
  const [params] = useSearchParams();
  const initialLocation =
    projectId ?? (params.get("location") === "personal" ? "personal" : (selectedId ?? "all"));
  return (
    <DocumentLibraryPage
      key={initialLocation}
      projectId={projectId}
      initialLocation={initialLocation}
    />
  );
}

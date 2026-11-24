import type { DocumentLocation } from "../../../common/entities/document";
import { DocumentLibraryPageView } from "../../components/library/DocumentLibraryPageView";
import { useDocumentLibraryPageModel } from "./useDocumentLibraryPageModel";
export function DocumentLibraryPageFeature({
  projectId,
  initialLocation,
}: {
  projectId?: number;
  initialLocation: DocumentLocation;
}) {
  const model = useDocumentLibraryPageModel({ projectId, initialLocation });
  return <DocumentLibraryPageView model={model} />;
}

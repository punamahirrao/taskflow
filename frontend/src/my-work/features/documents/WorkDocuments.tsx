import { useState } from "react";
import type { DataScope } from "../../../common/api/queryApi";
import { useDocumentsQuery } from "../../../documents/api/documentsQuery";
import { WorkDocumentsPanel } from "../../components/documents/WorkDocumentsPanel";
import { WorkDocumentsHeader } from "../../components/documents/WorkDocumentsHeader";
import { WorkDocumentsError } from "../../components/documents/WorkDocumentsError";
import { WorkDocumentsLoading } from "../../components/documents/WorkDocumentsLoading";
import { WorkDocumentsList } from "../../components/documents/WorkDocumentsList";
import { downloadWorkDocument } from "../../utils/downloadWorkDocument";

export function WorkDocuments({ scope }: { scope: DataScope }) {
  const { currentData, error, isFetching } = useDocumentsQuery({
    ...scope,
    location: "personal",
    folderId: null,
  });
  const [downloadError, setDownloadError] = useState("");
  async function download(id: number, filename: string) {
    setDownloadError("");
    try {
      await downloadWorkDocument(id, filename);
    } catch (cause) {
      setDownloadError(cause instanceof Error ? cause.message : "Could not download this file.");
    }
  }
  return (
    <WorkDocumentsPanel>
      <WorkDocumentsHeader />
      {(error || downloadError) && (
        <WorkDocumentsError message={downloadError || "Your private files could not be loaded."} />
      )}
      {isFetching && !currentData && <WorkDocumentsLoading />}
      {currentData && <WorkDocumentsList library={currentData} onDownload={download} />}
    </WorkDocumentsPanel>
  );
}

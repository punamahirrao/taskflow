import type { DocumentLibrary } from "../../../common/entities/document";
import { WorkDocumentFolder } from "./WorkDocumentFolder";
import { WorkDocumentFile } from "./WorkDocumentFile";
import { WorkDocumentLink } from "./WorkDocumentLink";
import { WorkDocumentsEmptyState } from "./WorkDocumentsEmptyState";
export function WorkDocumentsList({
  library,
  onDownload,
}: {
  library: DocumentLibrary;
  onDownload: (id: number, filename: string) => Promise<void>;
}) {
  return (
    <ul className="my-work-list">
      {library.folders.map((folder) => (
        <WorkDocumentFolder key={`folder-${folder.id}`} folder={folder} />
      ))}
      {library.documents.map((file) => (
        <WorkDocumentFile key={file.id} file={file} onDownload={onDownload} />
      ))}
      {library.links.map((link) => (
        <WorkDocumentLink key={`link-${link.id}`} link={link} />
      ))}
      {!library.folders.length && !library.documents.length && !library.links.length && (
        <WorkDocumentsEmptyState />
      )}
    </ul>
  );
}

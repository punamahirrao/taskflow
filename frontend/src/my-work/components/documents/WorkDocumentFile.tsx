import { Download, FileText } from "lucide-react";
import type { OrganizationDocument } from "../../../common/entities/document";
export function WorkDocumentFile({
  file,
  onDownload,
}: {
  file: OrganizationDocument;
  onDownload: (id: number, filename: string) => Promise<void>;
}) {
  return (
    <li>
      <FileText size={18} className="my-work-list-icon" />
      <span className="my-work-list-label">
        <b>{file.name}</b>
        <small>{Math.ceil(file.size / 1024)} KB</small>
      </span>
      <button
        type="button"
        className="my-work-icon-button"
        aria-label={`Download ${file.name}`}
        onClick={() => void onDownload(file.id, file.name)}
      >
        <Download size={17} />
      </button>
    </li>
  );
}

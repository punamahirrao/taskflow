import { FolderKanban } from "lucide-react";
import { Link } from "react-router-dom";
import type { DocumentFolder } from "../../../common/entities/document";
export function WorkDocumentFolder({ folder }: { folder: DocumentFolder }) {
  return (
    <li>
      <FolderKanban size={18} className="my-work-list-icon" />
      <Link className="my-work-item-link" to="/documents?location=personal">
        {folder.name}
        <small>Private folder</small>
      </Link>
    </li>
  );
}

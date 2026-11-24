import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
export function WorkDocumentsHeader() {
  return (
    <header className="my-work-panel-heading">
      <h2>My Documents</h2>
      <Link className="my-work-link" to="/documents?location=personal">
        Manage private files <ArrowUpRight size={15} />
      </Link>
    </header>
  );
}

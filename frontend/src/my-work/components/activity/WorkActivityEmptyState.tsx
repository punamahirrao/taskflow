import { History } from "lucide-react";
export function WorkActivityEmptyState() {
  return (
    <div className="my-work-agenda-empty">
      <History size={20} />
      <p>Changes to your assigned tasks will appear here.</p>
    </div>
  );
}

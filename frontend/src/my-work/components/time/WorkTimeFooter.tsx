import { Clock3 } from "lucide-react";
export function WorkTimeFooter({ full, onView }: { full?: boolean; onView: () => void }) {
  return (
    <footer className="my-work-panel-footer">
      <span>
        <Clock3 size={14} /> Saved on this browser
      </span>
      {!full && (
        <button type="button" className="my-work-link" onClick={onView}>
          View entries →
        </button>
      )}
    </footer>
  );
}

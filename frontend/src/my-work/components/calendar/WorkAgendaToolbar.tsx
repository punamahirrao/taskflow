import { ChevronLeft, ChevronRight } from "lucide-react";
import { displayDate } from "../../utils/workDates";
export function WorkAgendaToolbar({
  start,
  end,
  onPrevious,
  onToday,
  onNext,
}: {
  start: string;
  end: string;
  onPrevious: () => void;
  onToday: () => void;
  onNext: () => void;
}) {
  return (
    <div className="my-work-agenda-toolbar">
      <strong>
        {displayDate(start)} – {displayDate(end)}
      </strong>
      <div className="my-work-actions">
        <button
          type="button"
          className="my-work-icon-button"
          aria-label="Previous week"
          onClick={onPrevious}
        >
          <ChevronLeft size={17} />
        </button>
        <button type="button" className="my-work-button compact" onClick={onToday}>
          Today
        </button>
        <button
          type="button"
          className="my-work-icon-button"
          aria-label="Next week"
          onClick={onNext}
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

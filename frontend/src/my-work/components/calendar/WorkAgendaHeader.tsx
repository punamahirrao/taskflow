export function WorkAgendaHeader({ full, onView }: { full?: boolean; onView: () => void }) {
  return (
    <header className="my-work-panel-heading">
      <h2>My Calendar</h2>
      {!full && (
        <button className="my-work-link" onClick={onView}>
          View calendar →
        </button>
      )}
    </header>
  );
}

export function WorkActivityHeader({ full, onView }: { full?: boolean; onView: () => void }) {
  return (
    <header className="my-work-panel-heading">
      <h2>Updates on my tasks</h2>
      {!full && (
        <button type="button" className="my-work-link" onClick={onView}>
          View updates →
        </button>
      )}
    </header>
  );
}

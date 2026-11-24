export function AccessInboxMore({ onMore }: { onMore: () => void }) {
  return (
    <div className="project-more">
      <button className="project-text-link" type="button" onClick={onMore}>
        More requests
      </button>
    </div>
  );
}

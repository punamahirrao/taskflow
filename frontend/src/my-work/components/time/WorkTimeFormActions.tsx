export function WorkTimeFormActions({ onClose }: { onClose: () => void }) {
  return (
    <footer className="my-work-actions">
      <button type="button" className="my-work-button" onClick={onClose}>
        Cancel
      </button>
      <button type="submit" className="my-work-button primary">
        Save time
      </button>
    </footer>
  );
}

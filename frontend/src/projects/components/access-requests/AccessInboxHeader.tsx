export function AccessInboxHeader({ count }: { count: number }) {
  return (
    <h2 id="access-inbox-title">
      Access requests <span className="project-section-count">{count}</span>
    </h2>
  );
}

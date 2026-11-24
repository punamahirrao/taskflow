export function AssignedProjectOpenButton({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      className="project-card-open"
      onClick={onOpen}
      aria-label={`Open ${name}`}
    />
  );
}

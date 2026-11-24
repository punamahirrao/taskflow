export function SprintPlanningError({ error }: { error: string }) {
  return (
    <p className="text-danger" role="alert">
      {error}
    </p>
  );
}

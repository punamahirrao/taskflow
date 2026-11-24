import type { useDependenciesPageModel } from "../../features/dependencies/useDependenciesPageModel";
export function DependenciesLoading({
  model,
}: {
  model: ReturnType<typeof useDependenciesPageModel>;
}) {
  const { projectsError, error, actionError } = model;
  return (
    <p role="alert" className="mb-4 text-sm text-danger">
      {error || projectsError || actionError}
    </p>
  );
}

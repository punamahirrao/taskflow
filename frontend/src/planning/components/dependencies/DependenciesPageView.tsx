import { PaddedPage } from "../../../common/components/styled";
import { DependencyForm } from "../../features/dependency-form/DependencyForm";

import type { useDependenciesPageModel } from "../../features/dependencies/useDependenciesPageModel";
import { DependenciesError } from "./DependenciesError";
import { DependenciesHeader } from "./DependenciesHeader";
import { DependenciesLoading } from "./DependenciesLoading";
import { DependencyList } from "./DependencyList";
export function DependenciesPageView({
  model,
}: {
  model: ReturnType<typeof useDependenciesPageModel>;
}) {
  const {
    selectedId,
    projectsError,
    tasks,
    loading,
    error,
    creating,
    setCreating,
    actionError,
    editableProjects,
  } = model;
  return (
    <PaddedPage>
      <DependenciesHeader model={model} />
      {loading && <DependenciesError />}
      {(error || projectsError || actionError) && <DependenciesLoading model={model} />}
      <DependencyList model={model} />
      {creating && (
        <DependencyForm
          tasks={tasks}
          editableProjects={editableProjects}
          selectedProjectId={selectedId}
          onClose={() => setCreating(false)}
        />
      )}
    </PaddedPage>
  );
}

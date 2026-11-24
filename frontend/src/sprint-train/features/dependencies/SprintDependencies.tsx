import type { Task } from "../../../features/tasks/entities/task";
import { SprintDependenciesPanel } from "../../components/dependencies/SprintDependenciesPanel";
import { SprintDependenciesHeader } from "../../components/dependencies/SprintDependenciesHeader";
import { SprintDependenciesList } from "../../components/dependencies/SprintDependenciesList";
import { SprintDependencyRow } from "../../components/dependencies/SprintDependencyRow";
import { SprintDependenciesEmptyState } from "../../components/dependencies/SprintDependenciesEmptyState";
export function SprintDependencies({
  dependencies,
  tasks,
}: {
  dependencies: Task[];
  tasks: Task[];
}) {
  const rows = dependencies.map((task) => ({
    task,
    blockedBy: task.blocked_by
      .map((id) => tasks.find((candidate) => candidate.id === id))
      .filter((candidate): candidate is Task => Boolean(candidate && candidate.status !== "done")),
  }));
  return (
    <SprintDependenciesPanel>
      <SprintDependenciesHeader />
      <SprintDependenciesList>
        {rows.map(({ task, blockedBy }) => (
          <SprintDependencyRow key={task.id} task={task} blockedBy={blockedBy} />
        ))}
        {!rows.length && <SprintDependenciesEmptyState />}
      </SprintDependenciesList>
    </SprintDependenciesPanel>
  );
}

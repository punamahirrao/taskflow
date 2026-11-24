import { TaskSnapshotCard } from "../../components/task-snapshot/TaskSnapshotCard";
import { TaskSnapshotGrid } from "../../components/task-snapshot/TaskSnapshotGrid";
import type { DeliverySnapshot } from "../../entities/delivery";

export function TaskSnapshot({ snapshot }: { snapshot: DeliverySnapshot }) {
  const total = snapshot.projects.reduce((sum, project) => sum + project.total, 0);
  const done = snapshot.projects.reduce((sum, project) => sum + project.done, 0);
  const review = snapshot.projects.reduce((sum, project) => sum + project.in_review, 0);

  return (
    <TaskSnapshotGrid>
      <TaskSnapshotCard title="Open work" value={total - done} kind="open" />
      <TaskSnapshotCard title="Completed" value={done} kind="completed" />
      <TaskSnapshotCard title="In review" value={review} kind="review" />
      <TaskSnapshotCard title="Active sprints" value={snapshot.sprint_count} kind="sprints" />
    </TaskSnapshotGrid>
  );
}

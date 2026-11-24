import { TaskSnapshotIcon, type TaskSnapshotKind } from "./TaskSnapshotIcon";

export function TaskSnapshotCard({
  title,
  value,
  kind,
}: {
  title: string;
  value: number;
  kind: TaskSnapshotKind;
}) {
  return (
    <div className="delivery-metric">
      <TaskSnapshotIcon kind={kind} />
      <div>
        <h3>{title}</h3>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

import { CalendarClock, CircleCheck, GitPullRequest, Layers3 } from "lucide-react";

const metricIcons = {
  open: { Icon: Layers3, color: "violet" },
  completed: { Icon: CircleCheck, color: "teal" },
  review: { Icon: GitPullRequest, color: "blue" },
  sprints: { Icon: CalendarClock, color: "amber" },
};

export type TaskSnapshotKind = keyof typeof metricIcons;

export function TaskSnapshotIcon({ kind }: { kind: TaskSnapshotKind }) {
  const { Icon, color } = metricIcons[kind];
  return (
    <span className={`delivery-metric-icon ${color}`}>
      <Icon size={21} />
    </span>
  );
}

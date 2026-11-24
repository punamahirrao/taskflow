import { CalendarDays } from "lucide-react";
import type { Task } from "../../../features/tasks/entities/task";
import { weekLabel, type RoadmapPlan } from "../../utils/roadmapModel";
export function Insight({
  icon: Icon,
  label,
  value,
  critical = false,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  critical?: boolean;
}) {
  return (
    <div className={`roadmap-insight ${critical ? "critical" : ""}`}>
      <Icon size={19} />
      <span>
        <small>{label}</small>
        <b>{value}</b>
      </span>
    </div>
  );
}
export function DependencyTable({
  plan,
  tasks,
  onSelect,
}: {
  plan: RoadmapPlan;
  tasks: Task[];
  onSelect: (id: number) => void;
}) {
  const edges = plan.nodes.flatMap((node) =>
    node.task.blocked_by.map((id) => ({
      predecessor: tasks.find((task) => task.id === id),
      predecessorId: id,
      successor: node.task,
    })),
  );
  return (
    <div className="roadmap-table-scroll">
      <table className="roadmap-feature-table">
        <thead>
          <tr>
            <th>Predecessor</th>
            <th>Relationship</th>
            <th>Successor</th>
            <th>Expected week</th>
            <th>Schedule check</th>
          </tr>
        </thead>
        <tbody>
          {edges.map(({ predecessor, predecessorId, successor }) => (
            <tr key={`${predecessorId}-${successor.id}`}>
              <td>{predecessor?.title ?? `Work item #${predecessorId} (outside this project)`}</td>
              <td>
                <span className="roadmap-muted">Finish → Start</span>
              </td>
              <td>
                <button
                  type="button"
                  className="roadmap-table-name"
                  onClick={() => onSelect(successor.id)}
                >
                  {successor.title}
                </button>
              </td>
              <td>{weekLabel(successor.due_date)}</td>
              <td>
                {predecessor?.due_date &&
                successor.planned_start_date &&
                predecessor.due_date >= successor.planned_start_date ? (
                  <span className="roadmap-overlap">Dates overlap</span>
                ) : predecessor?.due_date && successor.planned_start_date ? (
                  "In sequence"
                ) : (
                  "Dates incomplete"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!edges.length && (
        <p className="roadmap-empty">
          No dependencies yet. Edit a feature and choose its predecessors.
        </p>
      )}
    </div>
  );
}

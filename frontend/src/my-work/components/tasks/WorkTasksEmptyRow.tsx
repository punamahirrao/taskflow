import type { WorkFilter } from "../../entities/work";
export function WorkTasksEmptyRow({ search, filter }: { search: string; filter: WorkFilter }) {
  return (
    <tr>
      <td colSpan={6} className="my-work-empty">
        {search
          ? "No tasks match your search."
          : `No ${filter === "Open" ? "open tasks assigned to you" : "tasks in this view"}.`}
      </td>
    </tr>
  );
}

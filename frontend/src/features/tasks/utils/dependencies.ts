import type { Task } from "../entities/task";

export function createsCycle(
  tasks: Pick<Task, "id" | "blocked_by">[],
  taskId: number,
  predecessorIds: number[],
) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const pending = [...predecessorIds];
  const visited = new Set<number>();
  while (pending.length) {
    const id = pending.pop()!;
    if (id === taskId) return true;
    if (visited.has(id)) continue;
    visited.add(id);
    pending.push(...(byId.get(id)?.blocked_by ?? []));
  }
  return false;
}

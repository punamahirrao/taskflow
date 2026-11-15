import type { Task } from "../../common/entities/task";
import { translate } from "../../common/shared/i18n/translate";

export function points(task: Task): number {
  const parsed = Number.parseFloat(task.estimate);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatDate(value: string | null): string {
  if (!value) return translate("sprintTrain.datesNotSet");
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function teamName(task: Task): string {
  return task.tags[0] ?? task.work_type.replace("_", " ");
}

import type { WorkTimeEntry } from "../entities/workTime";

export function readTimeEntries(key: string): WorkTimeEntry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [hours && `${hours}h`, remainder && `${remainder}m`].filter(Boolean).join(" ") || "0h";
}

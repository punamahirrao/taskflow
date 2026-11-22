export const percent = (done: number, total: number) =>
  total ? Math.round((done / total) * 100) : 0;

export function shortDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

export function WorkAgendaDay({
  day,
  count,
  selected,
  onSelect,
}: {
  day: Date;
  count: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" aria-pressed={selected} onClick={onSelect}>
      <span>{day.toLocaleDateString(undefined, { weekday: "short" })}</span>
      <b>{day.getDate()}</b>
      <small>{count ? `${count} due` : "–"}</small>
    </button>
  );
}

import { WorkAgendaDay } from "./WorkAgendaDay";
export function WorkAgendaWeek({
  days,
  selected,
  onSelect,
}: {
  days: { day: Date; key: string; count: number }[];
  selected: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="my-work-week" aria-label="Days in this week">
      {days.map(({ day, key, count }) => (
        <WorkAgendaDay
          key={key}
          day={day}
          count={count}
          selected={key === selected}
          onSelect={() => onSelect(key)}
        />
      ))}
    </div>
  );
}

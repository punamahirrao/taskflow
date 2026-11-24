import { useState } from "react";
import { dataScope } from "../../../common/api/queryApi";
import { useProjectContext } from "../../../common/features/projects/context/useProjectContext";
import { useCalendarQuery } from "../../api/calendarQuery";
function iso(day: Date) {
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
}
export function useCalendarPageModel() {
  const { selectedId } = useProjectContext();

  const [month, setMonth] = useState(
    () => new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  );

  const start = iso(month),
    end = iso(new Date(month.getFullYear(), month.getMonth() + 1, 0));

  const {
    currentData: events = [],
    isFetching,
    error,
    refetch,
  } = useCalendarQuery({ ...dataScope(selectedId), start, end });

  const offset = (month.getDay() + 6) % 7;

  const cells = Array.from(
    {
      length:
        Math.ceil((offset + new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()) / 7) *
        7,
    },
    (_, index) => new Date(month.getFullYear(), month.getMonth(), index - offset + 1),
  );

  const label = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const move = (delta: number) =>
    setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return { month, events, isFetching, error, refetch, cells, label, move };
}

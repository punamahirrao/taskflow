import { useState } from "react";
import type { Task } from "../../../features/tasks/entities/task";
import { dateKey, shiftDays } from "../../utils/workDates";
import { WorkAgendaHeader } from "../../components/calendar/WorkAgendaHeader";
import { WorkAgendaPanel } from "../../components/calendar/WorkAgendaPanel";
import { WorkAgendaToolbar } from "../../components/calendar/WorkAgendaToolbar";
import { WorkAgendaWeek } from "../../components/calendar/WorkAgendaWeek";
import { WorkAgendaList } from "../../components/calendar/WorkAgendaList";

export function WorkAgenda({
  tasks,
  full,
  onTask,
  onView,
}: {
  tasks: Task[];
  full?: boolean;
  onTask: (task: Task) => void;
  onView: () => void;
}) {
  const [offset, setOffset] = useState(0);
  const today = new Date();
  const start = shiftDays(today, offset * 7);
  const days = Array.from({ length: 7 }, (_, index) => shiftDays(start, index));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const selected = selectedDate ?? dateKey(start);
  const active = tasks.filter((task) => task.status !== "done" && task.due_date);
  const items = active.filter((task) =>
    full
      ? task.due_date === selected
      : task.due_date! >= dateKey(start) && task.due_date! <= dateKey(days[6]),
  );
  items.sort((a, b) => a.due_date!.localeCompare(b.due_date!) || a.title.localeCompare(b.title));

  const navigate = (week: number) => {
    setOffset(week);
    setSelectedDate(null);
  };

  const weekDays = days.map((day) => ({
    day,
    key: dateKey(day),
    count: active.filter((task) => task.due_date === dateKey(day)).length,
  }));
  const visibleTasks = items.slice(0, full ? items.length : 5);
  return (
    <WorkAgendaPanel>
      <WorkAgendaHeader full={full} onView={onView} />
      <WorkAgendaToolbar
        start={dateKey(start)}
        end={dateKey(days[6])}
        onPrevious={() => navigate(offset - 1)}
        onToday={() => navigate(0)}
        onNext={() => navigate(offset + 1)}
      />
      {full && <WorkAgendaWeek days={weekDays} selected={selected} onSelect={setSelectedDate} />}
      <WorkAgendaList tasks={visibleTasks} full={full} onTask={onTask} />
    </WorkAgendaPanel>
  );
}

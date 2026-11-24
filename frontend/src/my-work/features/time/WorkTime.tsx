import { useState } from "react";
import {
  workTimeCategories,
  type WorkTimeEntry,
  type WorkTimeDraft,
} from "../../entities/workTime";
import { readTimeEntries } from "../../utils/workTime";
import { dateKey, shiftDays } from "../../utils/workDates";
import { WorkTimePanel } from "../../components/time/WorkTimePanel";
import { WorkTimeHeader } from "../../components/time/WorkTimeHeader";
import { WorkTimeSummary } from "../../components/time/WorkTimeSummary";
import { WorkTimeFooter } from "../../components/time/WorkTimeFooter";
import { WorkTimeEntries } from "../../components/time/WorkTimeEntries";
import { WorkTimeError } from "../../components/time/WorkTimeError";
import { WorkTimeDialog } from "../../components/time/WorkTimeDialog";

export function WorkTime({
  storageKey,
  full,
  onView,
}: {
  storageKey: string;
  full?: boolean;
  onView: () => void;
}) {
  const [entries, setEntries] = useState(() => readTimeEntries(storageKey));
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const today = new Date();
  const start = dateKey(shiftDays(today, -((today.getDay() + 6) % 7)));
  const end = dateKey(today);
  const week = entries.filter((entry) => entry.date >= start && entry.date <= end);
  const totals = workTimeCategories.map((category) =>
    week
      .filter((entry) => entry.category === category)
      .reduce((total, entry) => total + entry.minutes, 0),
  );
  const total = totals.reduce((sum, minutes) => sum + minutes, 0);
  function save(next: WorkTimeEntry[]) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setEntries(next);
      setError("");
      return true;
    } catch {
      setError("This browser could not save your time log.");
      return false;
    }
  }

  function log(values: WorkTimeDraft) {
    if (save([{ id: crypto.randomUUID(), ...values }, ...entries])) setShowForm(false);
  }
  function startLog() {
    setError("");
    setShowForm(true);
  }
  function remove(id: string) {
    save(entries.filter((entry) => entry.id !== id));
  }
  const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <WorkTimePanel>
      <WorkTimeHeader onLog={startLog} />
      <WorkTimeSummary totals={totals} total={total} />
      <WorkTimeFooter full={full} onView={onView} />
      {full && <WorkTimeEntries entries={sortedEntries} onRemove={remove} />}
      {!showForm && error && <WorkTimeError message={error} />}
      {showForm && (
        <WorkTimeDialog
          maxDate={end}
          error={error}
          onSubmit={log}
          onClose={() => setShowForm(false)}
        />
      )}
    </WorkTimePanel>
  );
}

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Clock3, Plus, X } from "lucide-react";
import { dateKey, displayDate, shiftDays } from "../utils/workDates";

const categories = ["Task work", "Meetings", "Learning", "Other"] as const;
const colors = ["#375ae9", "#9358df", "#db5796", "#7793ba"];
type Category = (typeof categories)[number];
type Entry = { id: string; date: string; minutes: number; category: Category; note: string };

function readEntries(key: string): Entry[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(key) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function duration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return [hours && `${hours}h`, remainder && `${remainder}m`].filter(Boolean).join(" ") || "0h";
}

export function WorkTime({
  storageKey,
  full,
  onView,
}: {
  storageKey: string;
  full?: boolean;
  onView: () => void;
}) {
  const [entries, setEntries] = useState(() => readEntries(storageKey));
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const today = new Date();
  const start = dateKey(shiftDays(today, -((today.getDay() + 6) % 7)));
  const end = dateKey(today);
  const week = entries.filter((entry) => entry.date >= start && entry.date <= end);
  const totals = categories.map((category) =>
    week
      .filter((entry) => entry.category === category)
      .reduce((total, entry) => total + entry.minutes, 0),
  );
  const total = totals.reduce((sum, minutes) => sum + minutes, 0);
  let cursor = 0;
  const segments = totals.map((minutes, index) => {
    const from = cursor;
    cursor += total ? (minutes / total) * 100 : 0;
    return `${colors[index]} ${from}% ${cursor}%`;
  });

  useEffect(() => {
    if (!showForm) return;
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, [showForm]);

  function save(next: Entry[]) {
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

  function log(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const entry = {
      id: crypto.randomUUID(),
      date: String(form.get("date")),
      minutes: Number(form.get("minutes")),
      category: form.get("category") as Category,
      note: String(form.get("note")).trim(),
    };
    if (save([entry, ...entries])) setShowForm(false);
  }

  return (
    <section className="my-work-panel">
      <header className="my-work-panel-heading">
        <h2>
          My Time <span>· This week</span>
        </h2>
        <button
          type="button"
          className="my-work-link"
          onClick={() => {
            setError("");
            setShowForm(true);
          }}
        >
          <Plus size={15} /> Log time
        </button>
      </header>
      <div className="my-work-time">
        <div
          className="my-work-time-ring"
          style={{ background: total ? `conic-gradient(${segments.join(", ")})` : undefined }}
          aria-label={`${duration(total)} logged this week`}
        >
          <div>
            <strong>{duration(total)}</strong>
            <small>logged</small>
          </div>
        </div>
        <ul>
          {categories.map((category, index) => (
            <li key={category}>
              <span style={{ backgroundColor: colors[index] }} />
              <span>{category}</span>
              <b>{duration(totals[index])}</b>
            </li>
          ))}
        </ul>
      </div>
      <footer className="my-work-panel-footer">
        <span>
          <Clock3 size={14} /> Saved on this browser
        </span>
        {!full && (
          <button type="button" className="my-work-link" onClick={onView}>
            View entries →
          </button>
        )}
      </footer>
      {full && (
        <ul className="my-work-list">
          {[...entries]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((entry) => (
              <li key={entry.id}>
                <time dateTime={entry.date}>{displayDate(entry.date)}</time>
                <div className="my-work-list-label">
                  <b>{entry.category}</b>
                  {entry.note && <small>{entry.note}</small>}
                </div>
                <b>{duration(entry.minutes)}</b>
                <button
                  type="button"
                  className="my-work-icon-button"
                  aria-label={`Remove ${entry.category} time from ${displayDate(entry.date)}`}
                  onClick={() => save(entries.filter((item) => item.id !== entry.id))}
                >
                  <X size={16} />
                </button>
              </li>
            ))}
          {!entries.length && (
            <li className="my-work-muted">Log time to start your personal record.</li>
          )}
        </ul>
      )}
      {!showForm && error && (
        <p className="my-work-empty" role="alert">
          {error}
        </p>
      )}
      {showForm && (
        <dialog
          ref={dialog}
          className="my-work-dialog"
          aria-labelledby="my-work-time-title"
          onCancel={() => setShowForm(false)}
        >
          <header className="my-work-panel-heading">
            <h2 id="my-work-time-title">Log my time</h2>
          </header>
          <form className="my-work-form" onSubmit={log}>
            <div className="my-work-form-columns">
              <label>
                Date
                <input name="date" type="date" defaultValue={end} max={end} required />
              </label>
              <label>
                Minutes
                <input
                  name="minutes"
                  type="number"
                  min={1}
                  max={1440}
                  step={1}
                  autoFocus
                  required
                />
              </label>
            </div>
            <label>
              Category
              <select name="category">
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label>
              Note
              <input name="note" maxLength={160} placeholder="What did you work on?" />
            </label>
            {error && (
              <p role="alert" className="text-danger">
                {error}
              </p>
            )}
            <footer className="my-work-actions">
              <button type="button" className="my-work-button" onClick={() => setShowForm(false)}>
                Cancel
              </button>
              <button type="submit" className="my-work-button primary">
                Save time
              </button>
            </footer>
          </form>
        </dialog>
      )}
    </section>
  );
}

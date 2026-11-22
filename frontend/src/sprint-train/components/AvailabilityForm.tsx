import { useState, type FormEvent } from "react";
import type { AbsenceInput, CapacityMember, HolidayInput } from "../entities/capacity";

export default function AvailabilityForm({
  kind,
  members,
  start,
  end,
  busy,
  onSave,
  onCancel,
}: {
  kind: "absence" | "holiday";
  members: CapacityMember[];
  start: string;
  end: string;
  busy: boolean;
  onSave: (input: AbsenceInput | HolidayInput) => Promise<void>;
  onCancel: () => void;
}) {
  const [user, setUser] = useState(String(members[0]?.id ?? ""));
  const [absenceKind, setAbsenceKind] = useState<"vacation" | "absence">("vacation");
  const [from, setFrom] = useState(start);
  const [to, setTo] = useState(end);
  const [fraction, setFraction] = useState("1");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSave(
      kind === "holiday"
        ? { name: name.trim(), start_date: from, end_date: to }
        : {
            user_id: Number(user),
            kind: absenceKind,
            start_date: from,
            end_date: to,
            day_fraction: Number(fraction),
            note: note.trim(),
          },
    );
  }
  return (
    <form
      className="capacity-entry-form"
      onSubmit={(event) => void submit(event)}
      aria-label={kind === "holiday" ? "Log team holiday" : "Log time off"}
    >
      <fieldset disabled={busy}>
        <legend>{kind === "holiday" ? "New team holiday" : "New time off"}</legend>
        {kind === "absence" ? (
          <>
            <label>
              Team member
              <select value={user} onChange={(event) => setUser(event.target.value)} required>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Time off type
              <select
                value={absenceKind}
                onChange={(event) => setAbsenceKind(event.target.value as "vacation" | "absence")}
              >
                <option value="vacation">Vacation</option>
                <option value="absence">Absence</option>
              </select>
            </label>
          </>
        ) : (
          <label className="capacity-form-wide">
            Holiday name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
              autoFocus
            />
          </label>
        )}
        <label>
          Start date
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            required
          />
        </label>
        <label>
          End date
          <input
            type="date"
            value={to}
            min={from || undefined}
            onChange={(event) => setTo(event.target.value)}
            required
          />
        </label>
        {kind === "absence" && (
          <>
            <label>
              Duration per day
              <select value={fraction} onChange={(event) => setFraction(event.target.value)}>
                <option value="1">Full day</option>
                <option value="0.5">Half day each day</option>
              </select>
            </label>
            <label>
              Note (optional)
              <input
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={120}
              />
            </label>
          </>
        )}
        <div className="capacity-form-actions capacity-form-wide">
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
          <button className="capacity-primary" type="submit">
            {busy ? "Saving…" : kind === "holiday" ? "Save holiday" : "Save time off"}
          </button>
        </div>
      </fieldset>
    </form>
  );
}

export function AbsenceDurationFields({
  fraction,
  note,
  onFraction,
  onNote,
}: {
  fraction: string;
  note: string;
  onFraction: (value: string) => void;
  onNote: (value: string) => void;
}) {
  return (
    <>
      <label>
        Duration per day
        <select value={fraction} onChange={(event) => onFraction(event.target.value)}>
          <option value="1">Full day</option>
          <option value="0.5">Half day each day</option>
        </select>
      </label>
      <label>
        Note (optional)
        <input value={note} onChange={(event) => onNote(event.target.value)} maxLength={120} />
      </label>
    </>
  );
}

export function AvailabilityDateFields({
  from,
  to,
  onFrom,
  onTo,
}: {
  from: string;
  to: string;
  onFrom: (value: string) => void;
  onTo: (value: string) => void;
}) {
  return (
    <>
      <label>
        Start date
        <input type="date" value={from} onChange={(event) => onFrom(event.target.value)} required />
      </label>
      <label>
        End date
        <input
          type="date"
          value={to}
          min={from || undefined}
          onChange={(event) => onTo(event.target.value)}
          required
        />
      </label>
    </>
  );
}

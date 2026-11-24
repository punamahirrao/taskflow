export function HolidayNameField({
  name,
  onName,
}: {
  name: string;
  onName: (value: string) => void;
}) {
  return (
    <label className="capacity-form-wide">
      Holiday name
      <input
        value={name}
        onChange={(event) => onName(event.target.value)}
        maxLength={80}
        required
        autoFocus
      />
    </label>
  );
}

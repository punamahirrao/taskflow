export function WorkTaskDescriptionField({
  description,
  onChange,
}: {
  description: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      Description
      <textarea
        rows={3}
        value={description}
        maxLength={10000}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function WorkTaskTitleField({
  title,
  onChange,
}: {
  title: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      Title
      <input
        autoFocus
        required
        maxLength={255}
        value={title}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

export function WorkTimeDateFields({ maxDate }: { maxDate: string }) {
  return (
    <div className="my-work-form-columns">
      <label>
        Date
        <input name="date" type="date" defaultValue={maxDate} max={maxDate} required />
      </label>
      <label>
        Minutes
        <input name="minutes" type="number" min={1} max={1440} step={1} autoFocus required />
      </label>
    </div>
  );
}

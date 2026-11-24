export function AvailabilityFormActions({
  kind,
  busy,
  onCancel,
}: {
  kind: "absence" | "holiday";
  busy: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="capacity-form-actions capacity-form-wide">
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button className="capacity-primary" type="submit">
        {busy ? "Saving…" : kind === "holiday" ? "Save holiday" : "Save time off"}
      </button>
    </div>
  );
}

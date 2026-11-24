import type { ReactNode } from "react";

export function AvailabilityFormFrame({
  kind,
  busy,
  onSubmit,
  children,
}: {
  kind: "absence" | "holiday";
  busy: boolean;
  onSubmit: () => Promise<void>;
  children: ReactNode;
}) {
  return (
    <form
      className="capacity-entry-form"
      onSubmit={(event) => {
        event.preventDefault();
        void onSubmit();
      }}
      aria-label={kind === "holiday" ? "Log team holiday" : "Log time off"}
    >
      <fieldset disabled={busy}>
        <legend>{kind === "holiday" ? "New team holiday" : "New time off"}</legend>
        {children}
      </fieldset>
    </form>
  );
}

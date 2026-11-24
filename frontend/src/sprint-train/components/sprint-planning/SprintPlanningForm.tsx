import type { ReactNode } from "react";

export function SprintPlanningForm({
  children,
  onSave,
}: {
  children: ReactNode;
  onSave: () => Promise<void>;
}) {
  return (
    <form
      className="sprint-planning-form"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave();
      }}
    >
      {children}
    </form>
  );
}

import type { ReactNode } from "react";

export function CapacityPlanForm({
  canManage,
  busy,
  dirty,
  memberCount,
  onSave,
  children,
}: {
  canManage: boolean;
  busy: boolean;
  dirty: boolean;
  memberCount: number;
  onSave: () => Promise<unknown>;
  children: ReactNode;
}) {
  return (
    <form
      className="capacity-panel"
      onSubmit={(event) => {
        event.preventDefault();
        void onSave();
      }}
    >
      <div className="capacity-panel-header">
        <h3>People &amp; availability</h3>
        {canManage && (
          <button
            type="submit"
            className="capacity-primary"
            disabled={busy || !dirty || !memberCount}
          >
            {busy ? "Saving…" : "Save team plan"}
          </button>
        )}
      </div>
      <p className="capacity-muted">
        Full-sprint points × available weekdays ÷ sprint weekdays × allocation. Point budgets are
        entered by the team.
      </p>
      {dirty && (
        <p className="capacity-warning" role="status">
          Unsaved budgets — save the team plan to update the forecast.
        </p>
      )}
      {children}
    </form>
  );
}

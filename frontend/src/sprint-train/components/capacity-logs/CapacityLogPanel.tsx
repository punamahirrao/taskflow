import type { ReactNode } from "react";
import { Plus } from "lucide-react";

export function CapacityLogPanel({
  label,
  title,
  count,
  canAdd,
  disabled,
  addLabel,
  onToggleForm,
  children,
}: {
  label: string;
  title: string;
  count: number;
  canAdd: boolean;
  disabled: boolean;
  addLabel: string;
  onToggleForm: () => void;
  children: ReactNode;
}) {
  return (
    <section className="capacity-panel" aria-label={label}>
      <div className="capacity-panel-header">
        <h3>
          {title} <span className="capacity-muted">{count}</span>
        </h3>
        {canAdd && (
          <button disabled={disabled} onClick={onToggleForm}>
            <Plus size={14} aria-hidden="true" />
            {addLabel}
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

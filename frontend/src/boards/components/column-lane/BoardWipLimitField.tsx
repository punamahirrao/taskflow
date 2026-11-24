import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import type { BoardColumn } from "../../../features/tasks/entities/task";

export function BoardWipLimitField({
  column,
  busy,
  onSaveLimit,
}: {
  column: BoardColumn;
  busy: boolean;
  onSaveLimit: (column: BoardColumn, value: string) => void;
}) {
  const { t } = useTranslation();
  return (
    <label
      data-testid={`wip-limit-${column.id}-label`}
      className="flex items-center justify-end gap-1 px-1 text-[calc(10px*var(--taskflow-font-scale,1))] text-muted"
    >
      {column.name} {t("boards.wip")}
      <input
        data-testid={`wip-limit-${column.id}-input`}
        aria-label={t("boards.columnWipLimitAria", { name: column.name })}
        type="number"
        min="1"
        defaultValue={column.wip_limit ?? ""}
        key={`${column.id}-${column.wip_limit}`}
        disabled={busy}
        onBlur={(event) => onSaveLimit(column, event.target.value)}
        className="w-12 rounded border border-line bg-surface px-1 py-0.5 text-center text-[calc(10px*var(--taskflow-font-scale,1))] text-content"
      />
    </label>
  );
}

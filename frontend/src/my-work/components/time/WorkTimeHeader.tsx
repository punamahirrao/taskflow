import { Plus } from "lucide-react";
export function WorkTimeHeader({ onLog }: { onLog: () => void }) {
  return (
    <header className="my-work-panel-heading">
      <h2>
        My Time <span>· This week</span>
      </h2>
      <button type="button" className="my-work-link" onClick={onLog}>
        <Plus size={15} /> Log time
      </button>
    </header>
  );
}

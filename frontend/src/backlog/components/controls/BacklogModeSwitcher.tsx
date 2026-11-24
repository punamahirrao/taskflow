import type { BacklogMode } from "../../entities/backlogControls";
import { BacklogModeButton } from "./BacklogModeButton";

export function BacklogModeSwitcher({
  mode,
  onChange,
}: {
  mode: BacklogMode;
  onChange: (mode: BacklogMode) => void;
}) {
  return (
    <div className="flex rounded-lg bg-slate-100 p-1">
      <BacklogModeButton mode="groom" active={mode === "groom"} onSelect={onChange} />
      <BacklogModeButton mode="estimate" active={mode === "estimate"} onSelect={onChange} />
    </div>
  );
}

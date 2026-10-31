import { CalendarDays, X } from "lucide-react";
import { useState } from "react";
import type { TeamRosterMember } from "../../../entities/team";
import { memberName } from "../../../shared/utils/people";
import { useDialogBehavior } from "../../../shared/hooks/useDialogBehavior";

type Props = {
  member: TeamRosterMember;
  projectName: string;
  busy: boolean;
  error: string;
  onClose: () => void;
  onConfirm: (removalDate: string | null) => void;
};

export function TeamMemberRemovalDialog({ member, projectName, busy, error, onClose, onConfirm }: Props) {
  const [mode, setMode] = useState<"now" | "scheduled">("now");
  const [removalDate, setRemovalDate] = useState("");
  useDialogBehavior(onClose, busy);
  const name = memberName(member);

  return <div onClick={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <section role="dialog" aria-modal="true" aria-labelledby="remove-team-member-title" className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 id="remove-team-member-title" className="text-lg font-semibold text-gray-900">Remove team member</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">You are about to remove {name} from {projectName}. Do you want to remove this team member?</p>
          <p className="mt-2 text-sm text-gray-600">This only revokes access to this project. Their system account, comments, tasks, and assignments will be kept.</p>
        </div>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Close dialog" className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 disabled:opacity-50"><X size={20} aria-hidden="true" /></button>
      </header>

      <fieldset className="mt-5 space-y-3" disabled={busy}>
        <legend className="sr-only">When should project access be removed?</legend>
        <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${mode === "now" ? "border-purple-300 bg-purple-50" : "border-gray-200"}`}>
          <input type="radio" name="removal-mode" checked={mode === "now"} onChange={() => setMode("now")} />
          <span className="text-sm font-medium text-gray-800">Remove now</span>
        </label>
        <label className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${mode === "scheduled" ? "border-purple-300 bg-purple-50" : "border-gray-200"}`}>
          <input type="radio" name="removal-mode" checked={mode === "scheduled"} onChange={() => setMode("scheduled")} />
          <CalendarDays size={18} aria-hidden="true" className="text-purple-600" />
          <span className="text-sm font-medium text-gray-800">Choose an expected removal date</span>
        </label>
        {mode === "scheduled" && <label className="ml-8 block text-sm font-medium text-gray-700">Expected removal date
          <input type="date" min={tomorrow()} value={removalDate} onChange={(event) => setRemovalDate(event.target.value)} className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2" />
        </label>}
      </fieldset>

      {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}
      <footer className="mt-6 flex justify-end gap-3">
        <button type="button" onClick={onClose} disabled={busy} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 disabled:opacity-50">Cancel</button>
        <button type="button" disabled={busy || (mode === "scheduled" && !removalDate)} onClick={() => onConfirm(mode === "scheduled" ? removalDate : null)} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Saving…" : mode === "now" ? "Remove now" : "Schedule removal"}
        </button>
      </footer>
    </section>
  </div>;
}

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

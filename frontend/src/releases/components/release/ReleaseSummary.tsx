import { Check, ClipboardCheck, Flag } from "lucide-react";
import type { useReleasePageModel } from "../../features/release/useReleasePageModel";

export function ReleaseSummary({ model }: { model: ReturnType<typeof useReleasePageModel> }) {
  const { items, numberInReview, numberReady } = model;
  return (
    <div className="release-summary">
      <span>
        <Flag size={19} /> <b>{items.length}</b> releases
      </span>
      <span>
        <ClipboardCheck size={19} /> <b>{numberInReview}</b> in progress
      </span>
      <span>
        <Check size={19} /> <b>{numberReady}</b> ready to release
      </span>
    </div>
  );
}

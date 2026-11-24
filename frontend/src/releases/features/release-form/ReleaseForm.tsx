import { ReleaseFormView } from "../../components/release-form/ReleaseFormView";
import { useReleaseFormModel } from "./useReleaseFormModel";
export function ReleaseForm({
  release,
  members,
  goals,
  onClose,
  onSaved,
}: Parameters<typeof useReleaseFormModel>[0]) {
  const model = useReleaseFormModel({ release, members, goals, onClose, onSaved });
  return <ReleaseFormView model={model} />;
}

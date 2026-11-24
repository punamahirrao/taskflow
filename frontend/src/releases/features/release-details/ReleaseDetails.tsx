import { ReleaseDetailsView } from "../../components/release-details/ReleaseDetailsView";
import type { Approver, Release } from "../../entities/release";
import { useReleaseDetailsModel } from "./useReleaseDetailsModel";
export function ReleaseDetails({
  release,
  members,
  canManage,
  onEdit,
}: {
  release: Release;
  members: Approver[];
  canManage: boolean;
  onEdit: () => void;
}) {
  const model = useReleaseDetailsModel({ release, members, canManage, onEdit });
  return <ReleaseDetailsView model={model} />;
}

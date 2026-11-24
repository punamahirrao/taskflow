import type { BacklogControlsProps } from "../../entities/backlogControls";
import type { BacklogWorkListProps } from "../../entities/backlogWork";
import { BacklogWorkspacePanel } from "../../components/workspace/BacklogWorkspacePanel";
import { BacklogReorderingStatus } from "../../components/workspace/BacklogReorderingStatus";
import { BacklogWorkspaceError } from "../../components/workspace/BacklogWorkspaceError";
import { BacklogControls } from "../controls/BacklogControls";
import { BacklogWorkList } from "../work-list/BacklogWorkList";

export function BacklogWorkspace({
  controls,
  list,
  error,
}: {
  controls: BacklogControlsProps;
  list: BacklogWorkListProps;
  error: string;
}) {
  return (
    <BacklogWorkspacePanel>
      <BacklogControls {...controls} />
      {list.reordering && <BacklogReorderingStatus />}
      {error && <BacklogWorkspaceError message={error} />}
      <BacklogWorkList {...list} />
    </BacklogWorkspacePanel>
  );
}

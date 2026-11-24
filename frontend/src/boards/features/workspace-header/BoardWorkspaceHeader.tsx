import type { BoardWorkspaceHeaderProps } from "../../entities/workspaceHeader";
import { BoardWorkspaceHeaderLayout } from "../../components/workspace-header/BoardWorkspaceHeaderLayout";
import { BoardBackButton } from "../../components/workspace-header/BoardBackButton";
import { BoardChooser } from "../../components/workspace-header/BoardChooser";
import { BoardConfigureButton } from "../../components/workspace-header/BoardConfigureButton";
import { BoardSwimlaneSelect } from "../../components/workspace-header/BoardSwimlaneSelect";
import { BoardSprintModeButton } from "../../components/workspace-header/BoardSprintModeButton";
import { BoardRefreshButton } from "../../components/workspace-header/BoardRefreshButton";

export function BoardWorkspaceHeader(props: BoardWorkspaceHeaderProps) {
  return (
    <BoardWorkspaceHeaderLayout name={props.name}>
      <BoardBackButton onBack={props.onBack} />
      {props.projectBoards.length > 1 && (
        <BoardChooser
          boards={props.projectBoards}
          selectedId={props.selectedBoardId}
          onChange={props.onBoardChange}
        />
      )}
      {props.canManage && <BoardConfigureButton onConfigure={props.onConfigure} />}
      <BoardSwimlaneSelect value={props.swimlane} onChange={props.onSwimlane} />
      {props.usesSprints && (
        <BoardSprintModeButton active={props.sprintMode} onToggle={props.onToggleSprintMode} />
      )}
      <BoardRefreshButton onRefresh={props.onRefresh} />
    </BoardWorkspaceHeaderLayout>
  );
}

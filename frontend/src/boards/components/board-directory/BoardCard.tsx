import type { BoardCardProps } from "../../entities/boardCard";
import { BoardCardFrame } from "./BoardCardFrame";
import { BoardCardOpenArea } from "./BoardCardOpenArea";
import { BoardCardHeading } from "./BoardCardHeading";
import { BoardCardDescription } from "./BoardCardDescription";
import { BoardCardMetrics } from "./BoardCardMetrics";
import { BoardCardUpdated } from "./BoardCardUpdated";
import { BoardCardMembers } from "./BoardCardMembers";
import { BoardCardMenu } from "./BoardCardMenu";
import { BoardCardFooter } from "./BoardCardFooter";

export function BoardCard(props: BoardCardProps) {
  return (
    <BoardCardFrame>
      <BoardCardOpenArea onOpen={props.onOpen}>
        <BoardCardHeading board={props.board} project={props.project} />
        <BoardCardDescription description={props.board.description} />
        <BoardCardMetrics board={props.board} />
        <BoardCardUpdated updatedAt={props.board.updated_at} />
      </BoardCardOpenArea>
      <BoardCardFooter>
        <BoardCardMembers board={props.board} />
        {props.canManage && <BoardCardMenu {...props} />}
      </BoardCardFooter>
    </BoardCardFrame>
  );
}

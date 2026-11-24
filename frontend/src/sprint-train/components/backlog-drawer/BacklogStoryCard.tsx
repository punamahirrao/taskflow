import type { Task } from "../../../features/tasks/entities/task";
import { BacklogStoryFrame } from "./BacklogStoryFrame";
import { BacklogStoryBadges } from "./BacklogStoryBadges";
import { BacklogWishlistButton } from "./BacklogWishlistButton";
import { BacklogStoryAvatar } from "./BacklogStoryAvatar";
import { BacklogStoryPoints } from "./BacklogStoryPoints";

export function BacklogStoryCard({
  task,
  selected,
  wishlistSavingId,
  onSelectStory,
  onToggleWishlist,
}: {
  task: Task;
  selected: boolean;
  wishlistSavingId: number | null;
  onSelectStory: (id: number) => void;
  onToggleWishlist: (task: Task) => void;
}) {
  return (
    <BacklogStoryFrame task={task} selected={selected} onSelectStory={onSelectStory}>
      <div className="sprint-backlog-card-top">
        <span className="font-mono text-[calc(10px*var(--taskflow-font-scale,1))] font-bold text-indigo-600">
          NEX-{task.id}
        </span>
        <BacklogStoryBadges task={task} />
        <div className="sprint-backlog-card-points">
          <BacklogWishlistButton
            task={task}
            wishlistSavingId={wishlistSavingId}
            onToggleWishlist={onToggleWishlist}
          />
          <BacklogStoryAvatar task={task} />
          <BacklogStoryPoints task={task} />
        </div>
      </div>
      <h3 className="sprint-backlog-title mt-2 text-sm font-semibold leading-5">{task.title}</h3>
    </BacklogStoryFrame>
  );
}

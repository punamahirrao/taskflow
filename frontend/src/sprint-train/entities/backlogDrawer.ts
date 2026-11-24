import type { Sprint, Task } from "../../features/tasks/entities/task";

export interface BacklogDrawerProps {
  open: boolean;
  createStoryOpen: boolean;
  selectedSprint: Sprint | null;
  selectedSprintPoints: number;
  wishlistOnly: boolean;
  itemCount: number;
  newStoryTitle: string;
  newStoryDescription: string;
  newStoryEstimate: string;
  savingStory: boolean;
  backlogSearch: string;
  readyOnly: boolean;
  filteredBacklog: Task[];
  loading: boolean;
  selectedTaskId: number | null;
  wishlistSavingId: number | null;
  onClose: () => void;
  onToggleWishlistView: () => void;
  onToggleCreateStory: () => void;
  onSubmitStory: () => Promise<void>;
  onStoryTitleChange: (value: string) => void;
  onStoryDescriptionChange: (value: string) => void;
  onStoryEstimateChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onToggleReady: () => void;
  onSelectStory: (taskId: number) => void;
  onToggleWishlist: (task: Task) => void;
}

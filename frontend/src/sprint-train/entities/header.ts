export interface SprintTrainHeaderProps {
  projectName: string;
  role?: string;
  drawerOpen: boolean;
  storyLabel: string;
  closeStoryLabel: string;
  newSprintLabel: string;
  sectionLabel: string;
  canCreateSprint: boolean;
  onToggleBacklog: () => void;
  onCreateSprint: () => void;
}

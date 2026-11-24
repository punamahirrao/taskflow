import type { BacklogDrawerProps } from "../../entities/backlogDrawer";
import { BacklogDrawerFrame } from "../../components/backlog-drawer/BacklogDrawerFrame";
import { BacklogDrawerHeader } from "../../components/backlog-drawer/BacklogDrawerHeader";
import { BacklogDrawerTitle } from "../../components/backlog-drawer/BacklogDrawerTitle";
import { BacklogDrawerSummary } from "../../components/backlog-drawer/BacklogDrawerSummary";
import { SelectedSprintPoints } from "../../components/backlog-drawer/SelectedSprintPoints";
import { BacklogWishlistFilter } from "../../components/backlog-drawer/BacklogWishlistFilter";
import { BacklogAddStoryButton } from "../../components/backlog-drawer/BacklogAddStoryButton";
import { BacklogDrawerFilters } from "../../components/backlog-drawer/BacklogDrawerFilters";
import { BacklogStoryList } from "../../components/backlog-drawer/BacklogStoryList";
import { BacklogStoryCard } from "../../components/backlog-drawer/BacklogStoryCard";
import { BacklogDrawerEmptyState } from "../../components/backlog-drawer/BacklogDrawerEmptyState";
import { CreateSprintStoryForm } from "../create-story/CreateSprintStoryForm";
export function BacklogDrawer(props: BacklogDrawerProps) {
  if (!props.open) return null;
  return (
    <BacklogDrawerFrame creating={props.createStoryOpen}>
      <BacklogDrawerHeader>
        <BacklogDrawerTitle onClose={props.onClose} />
        <BacklogDrawerSummary>
          <SelectedSprintPoints points={props.selectedSprintPoints} />
          <BacklogWishlistFilter
            wishlistOnly={props.wishlistOnly}
            itemCount={props.itemCount}
            onToggleWishlistView={props.onToggleWishlistView}
          />
          <BacklogAddStoryButton
            selectedSprint={props.selectedSprint}
            createStoryOpen={props.createStoryOpen}
            onToggleCreateStory={props.onToggleCreateStory}
          />
        </BacklogDrawerSummary>
        {props.createStoryOpen && props.selectedSprint && (
          <CreateSprintStoryForm
            sprint={props.selectedSprint}
            title={props.newStoryTitle}
            description={props.newStoryDescription}
            estimate={props.newStoryEstimate}
            saving={props.savingStory}
            onTitle={props.onStoryTitleChange}
            onDescription={props.onStoryDescriptionChange}
            onEstimate={props.onStoryEstimateChange}
            onSubmit={props.onSubmitStory}
          />
        )}
        <BacklogDrawerFilters
          backlogSearch={props.backlogSearch}
          readyOnly={props.readyOnly}
          onSearchChange={props.onSearchChange}
          onToggleReady={props.onToggleReady}
        />
      </BacklogDrawerHeader>
      <BacklogStoryList>
        {props.filteredBacklog.map((task) => (
          <BacklogStoryCard
            key={task.id}
            task={task}
            selected={props.selectedTaskId === task.id}
            wishlistSavingId={props.wishlistSavingId}
            onSelectStory={props.onSelectStory}
            onToggleWishlist={props.onToggleWishlist}
          />
        ))}
        {!props.filteredBacklog.length && <BacklogDrawerEmptyState loading={props.loading} />}
      </BacklogStoryList>
    </BacklogDrawerFrame>
  );
}

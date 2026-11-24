import type { StoryCommentsProps } from "../../entities/storyComments";
import { StoryCommentsLayout } from "../../components/story-comments/StoryCommentsLayout";
import { StoryCommentsList } from "../../components/story-comments/StoryCommentsList";
import { StoryCommentsLoading } from "../../components/story-comments/StoryCommentsLoading";
import { StoryCommentsEmptyState } from "../../components/story-comments/StoryCommentsEmptyState";
import { StoryCommentCard } from "../../components/story-comments/StoryCommentCard";
import { NewStoryCommentForm } from "../../components/story-comments/NewStoryCommentForm";
export function StoryComments(props: StoryCommentsProps) {
  return (
    <StoryCommentsLayout>
      <StoryCommentsList>
        {props.loading && <StoryCommentsLoading />}
        {!props.loading && !props.comments.length && <StoryCommentsEmptyState />}
        {props.comments.map((comment) => (
          <StoryCommentCard
            key={comment.id}
            comment={comment}
            editing={props.editingId === comment.id}
            text={props.editingText}
            saving={props.saving}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
            onSave={props.onSave}
            onCancel={props.onCancelEdit}
            onText={props.onEditingText}
          />
        ))}
      </StoryCommentsList>
      <NewStoryCommentForm
        text={props.newComment}
        saving={props.saving}
        onText={props.onNewComment}
        onSubmit={props.onSubmit}
      />
    </StoryCommentsLayout>
  );
}

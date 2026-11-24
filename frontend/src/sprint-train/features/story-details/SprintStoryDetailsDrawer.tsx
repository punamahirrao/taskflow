import { useEffect, useState } from "react";
import {
  createTaskComment,
  deleteTaskComment,
  getTaskComments,
  getTaskHistory,
  updateTaskComment,
} from "../../../features/tasks/api/activity";
import type { TaskComment, TaskHistoryEntry } from "../../../features/tasks/entities/taskActivity";
import { useTranslation } from "../../../common/shared/i18n/hooks/useTranslation";
import { translate } from "../../../common/shared/i18n/translate";
import type { ReadyCheck } from "../../entities/sprintTrain";
import type { DrawerTab, SprintStoryDetailsDrawerProps } from "../../entities/storyDetails";
import { firstValidationError, commentSchema } from "../../../common/validation/schemas";
import { useToast } from "../../../common/features/notifications/useToast";
import { StoryDetailsFrame } from "../../components/story-details/StoryDetailsFrame";
import { StoryDetailsHeader } from "../../components/story-details/StoryDetailsHeader";
import { StoryDetailsTabs } from "../../components/story-details/StoryDetailsTabs";
import { StoryActivityError } from "../../components/story-details/StoryActivityError";
import { StoryDetails } from "./StoryDetails";
import { StoryComments } from "../story-comments/StoryComments";
import { StoryHistory } from "../story-history/StoryHistory";

export function SprintStoryDetailsDrawer(props: SprintStoryDetailsDrawerProps) {
  return <SprintStoryContent key={props.task.id} {...props} />;
}
function SprintStoryContent({
  task,
  onClose,
  projectName,
  onUpdate,
  backlogDrawerOpen = false,
  drawerClassName = "",
  open = true,
}: SprintStoryDetailsDrawerProps) {
  const { t } = useTranslation();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<DrawerTab>("details");
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [history, setHistory] = useState<TaskHistoryEntry[]>([]);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState("");
  const [savingActivity, setSavingActivity] = useState(false);
  useEffect(() => {
    let active = true;
    void Promise.all([getTaskComments(task.id), getTaskHistory(task.id)])
      .then(([loadedComments, loadedHistory]) => {
        if (active) {
          setComments(loadedComments);
          setHistory(loadedHistory);
        }
      })
      .catch((cause: unknown) => {
        if (active)
          setActivityError(
            cause instanceof Error ? cause.message : translate("sprintTrain.errorLoadActivity"),
          );
      })
      .finally(() => {
        if (active) setActivityLoading(false);
      });
    return () => {
      active = false;
    };
  }, [task.id]);

  async function refreshActivity() {
    const [loadedComments, loadedHistory] = await Promise.all([
      getTaskComments(task.id),
      getTaskHistory(task.id),
    ]);
    setComments(loadedComments);
    setHistory(loadedHistory);
  }

  async function submitComment() {
    const validationError = firstValidationError(commentSchema, { text: newComment });
    if (validationError) {
      setActivityError(validationError);
      toast("error", validationError);
      return;
    }
    setSavingActivity(true);
    setActivityError("");
    try {
      await createTaskComment(task.id, newComment.trim());
      setNewComment("");
      await refreshActivity();
      toast("success", t("sprintTrain.commentPostedToast"));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("sprintTrain.errorAddComment");
      setActivityError(message);
      toast("error", message);
    } finally {
      setSavingActivity(false);
    }
  }

  async function saveComment(comment: TaskComment) {
    const validationError = firstValidationError(commentSchema, { text: editingCommentText });
    if (validationError) {
      setActivityError(validationError);
      toast("error", validationError);
      return;
    }
    setSavingActivity(true);
    setActivityError("");
    try {
      await updateTaskComment(task.id, comment.id, editingCommentText.trim());
      setEditingCommentId(null);
      setEditingCommentText("");
      await refreshActivity();
      toast("success", t("sprintTrain.commentSavedToast"));
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : t("sprintTrain.errorUpdateComment");
      setActivityError(message);
      toast("error", message);
    } finally {
      setSavingActivity(false);
    }
  }

  async function removeComment(comment: TaskComment) {
    setSavingActivity(true);
    setActivityError("");
    try {
      await deleteTaskComment(task.id, comment.id);
      await refreshActivity();
    } catch (cause) {
      setActivityError(
        cause instanceof Error ? cause.message : t("sprintTrain.errorDeleteComment"),
      );
    } finally {
      setSavingActivity(false);
    }
  }

  const readyChecks: ReadyCheck[] = [
    { labelKey: "sprintTrain.readyDescription", ready: Boolean(task.description.trim()) },
    { labelKey: "sprintTrain.readyEstimate", ready: Boolean(task.estimate) },
    { labelKey: "sprintTrain.readyOwner", ready: Boolean(task.assignee) },
    { labelKey: "sprintTrain.readyForSprint", ready: task.ready_for_sprint },
  ];

  function editComment(comment: TaskComment) {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.content);
  }
  return (
    <StoryDetailsFrame
      task={task}
      onClose={onClose}
      backlogDrawerOpen={backlogDrawerOpen}
      drawerClassName={drawerClassName}
      open={open}
    >
      <StoryDetailsHeader task={task} onUpdate={onUpdate} onClose={onClose} />
      <StoryDetailsTabs activeTab={activeTab} commentCount={comments.length} onTab={setActiveTab} />
      {activityError && <StoryActivityError message={activityError} />}
      {activeTab === "details" && (
        <StoryDetails
          task={task}
          projectName={projectName}
          onUpdate={onUpdate}
          readyChecks={readyChecks}
        />
      )}
      {activeTab === "comments" && (
        <StoryComments
          comments={comments}
          loading={activityLoading}
          editingId={editingCommentId}
          editingText={editingCommentText}
          saving={savingActivity}
          newComment={newComment}
          onEdit={editComment}
          onDelete={removeComment}
          onSave={saveComment}
          onCancelEdit={() => setEditingCommentId(null)}
          onEditingText={setEditingCommentText}
          onNewComment={setNewComment}
          onSubmit={submitComment}
        />
      )}
      {activeTab === "history" && <StoryHistory history={history} loading={activityLoading} />}
    </StoryDetailsFrame>
  );
}

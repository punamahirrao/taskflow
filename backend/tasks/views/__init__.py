from .detail import TaskDetailView
from .agile import ProjectBoardColumnDetailView, ProjectBoardColumnsView, SprintCloseView, SprintDetailView, SprintListCreateView
from .list_create import TaskListCreateView
from .comments import TaskCommentDetailView, TaskCommentListCreateView
from .history import TaskHistoryListView

__all__ = ["TaskDetailView", "TaskListCreateView", "ProjectBoardColumnDetailView", "ProjectBoardColumnsView", "SprintDetailView", "SprintListCreateView", "SprintCloseView", "TaskCommentDetailView", "TaskCommentListCreateView", "TaskHistoryListView"]

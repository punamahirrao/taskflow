from .detail import TaskDetailView
from .agile import ProjectBoardColumnDetailView, ProjectBoardColumnsView, SprintCloseView, SprintDetailView, SprintListCreateView
from .list_create import TaskListCreateView

__all__ = ["TaskDetailView", "TaskListCreateView", "ProjectBoardColumnDetailView", "ProjectBoardColumnsView", "SprintDetailView", "SprintListCreateView", "SprintCloseView"]

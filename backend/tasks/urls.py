from django.urls import path

from tasks.views import (
    ProjectBoardColumnDetailView,
    ProjectBoardColumnsView,
    SprintDetailView,
    SprintCloseView,
    SprintListCreateView,
    TaskDetailView,
    TaskListCreateView,
)

urlpatterns = [
    path("", TaskListCreateView.as_view(), name="task-list-create"),
    path("sprints/", SprintListCreateView.as_view(), name="sprint-list-create"),
    path("sprints/<int:sprint_id>/", SprintDetailView.as_view(), name="sprint-detail"),
    path("sprints/<int:sprint_id>/close/", SprintCloseView.as_view(), name="sprint-close"),
    path("projects/<int:project_id>/columns/", ProjectBoardColumnsView.as_view(), name="board-columns"),
    path("projects/<int:project_id>/columns/<int:column_id>/", ProjectBoardColumnDetailView.as_view(), name="board-column-detail"),
    path("<int:task_id>/", TaskDetailView.as_view(), name="task-detail"),
]

from django.urls import path
from projects.views import (
    DefaultProjectView,
    ProjectDetailView,
    ProjectListView,
    ProjectMemberDetailView,
    ProjectMemberListView,
)
from projects.views.projects import ProjectDirectoryView
from projects.views.access_requests import ProjectAccessRequestView, ProjectAccessRequestInboxView, ProjectAccessRequestReviewView
from projects.views.planning import PlanningItemsView, PlanningItemDetailView
from projects.views.releases import ReleasesView, ReleaseDetailView, ReleaseActionView
from projects.views.workflows import ProjectWorkflowView

urlpatterns = [
    path("releases/", ReleasesView.as_view(), name="releases"),
    path("releases/<int:pk>/", ReleaseDetailView.as_view(), name="release-detail"),
    path(
        "releases/<int:pk>/actions/", ReleaseActionView.as_view(), name="release-action"
    ),
    path("planning/", PlanningItemsView.as_view(), name="planning-items"),
    path("planning/<int:pk>/", PlanningItemDetailView.as_view(), name="planning-item"),
    path("<int:project_id>/workflows/<str:kind>/", ProjectWorkflowView.as_view(), name="project-workflow"),
    path("", ProjectListView.as_view(), name="project-list"),
    path("default/", DefaultProjectView.as_view(), name="project-default"),
    path("directory/", ProjectDirectoryView.as_view(), name="project-directory"),
    path("access-requests/", ProjectAccessRequestInboxView.as_view(), name="project-access-inbox"),
    path("access-requests/<int:pk>/", ProjectAccessRequestReviewView.as_view(), name="project-access-review"),
    path("<int:pk>/access-requests/", ProjectAccessRequestView.as_view(), name="project-access-request"),
    path("<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path("<int:pk>/members/", ProjectMemberListView.as_view(), name="project-members"),
    path(
        "<int:pk>/members/<int:user_id>/",
        ProjectMemberDetailView.as_view(),
        name="project-member-detail",
    ),
]

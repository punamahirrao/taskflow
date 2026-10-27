from django.urls import path
from projects.views import (
    DefaultProjectView,
    ProjectDetailView,
    ProjectListView,
    ProjectMemberDetailView,
    ProjectMemberListView,
)

urlpatterns = [
    path("", ProjectListView.as_view(), name="project-list"),
    path("default/", DefaultProjectView.as_view(), name="project-default"),
    path("<int:pk>/", ProjectDetailView.as_view(), name="project-detail"),
    path("<int:pk>/members/", ProjectMemberListView.as_view(), name="project-members"),
    path(
        "<int:pk>/members/<int:user_id>/",
        ProjectMemberDetailView.as_view(),
        name="project-member-detail",
    ),
]

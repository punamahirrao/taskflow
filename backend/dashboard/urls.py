from django.urls import path

from dashboard.views import (
    DashboardActiveSprintsView,
    DashboardMyTasksView,
    DashboardOverviewView,
    DashboardProjectHealthView,
)

urlpatterns = [
    path("overview/", DashboardOverviewView.as_view(), name="dashboard-overview"),
    path("active-sprints/", DashboardActiveSprintsView.as_view(), name="dashboard-active-sprints"),
    path("my-tasks/", DashboardMyTasksView.as_view(), name="dashboard-my-tasks"),
    path("project-health/", DashboardProjectHealthView.as_view(), name="dashboard-project-health"),
]

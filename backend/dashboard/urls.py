from django.urls import path

from dashboard.views import (
    DashboardActivityView,
    DashboardDeliveryView,
    CalendarEventsView,
    DashboardActiveSprintsView,
    DashboardMyTasksView,
    DashboardOverviewView,
    DashboardProjectHealthView,
)

urlpatterns = [
    path("delivery/", DashboardDeliveryView.as_view(), name="dashboard-delivery"),
    path("activity/", DashboardActivityView.as_view(), name="dashboard-activity"),
    path("calendar/", CalendarEventsView.as_view(), name="calendar-events"),
    path("overview/", DashboardOverviewView.as_view(), name="dashboard-overview"),
    path(
        "active-sprints/",
        DashboardActiveSprintsView.as_view(),
        name="dashboard-active-sprints",
    ),
    path("my-tasks/", DashboardMyTasksView.as_view(), name="dashboard-my-tasks"),
    path(
        "project-health/",
        DashboardProjectHealthView.as_view(),
        name="dashboard-project-health",
    ),
]

from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from common.pagination import StandardResultsPagination
from dashboard.delivery import delivery_snapshot
from dashboard.serializers import (
    DashboardOverviewSerializer,
    DashboardQuerySerializer,
    PaginatedTaskSerializer,
    ProjectHealthSerializer,
)
from dashboard.services import (
    active_sprints_for_user,
    my_tasks_for_user,
    overview_for_user,
    project_health_for_user,
)
from tasks.serializers import SprintSerializer, TaskSerializer


def get_project_id(request: Request) -> int | None:
    serializer = DashboardQuerySerializer(data=request.query_params)
    serializer.is_valid(raise_exception=True)
    return serializer.validated_data.get("project_id")


class DashboardDeliveryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(delivery_snapshot(request.user, get_project_id(request)))


class DashboardOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get dashboard overview",
        description="Returns project and task totals for the authenticated user's visible projects.",
        parameters=[DashboardQuerySerializer],
        responses=DashboardOverviewSerializer,
    )
    def get(self, request: Request):
        return Response(
            DashboardOverviewSerializer(
                overview_for_user(request.user, get_project_id(request))
            ).data
        )


class DashboardActiveSprintsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="List active sprints",
        description="Lists active, open sprints in projects visible to the authenticated user.",
        parameters=[DashboardQuerySerializer],
        responses=SprintSerializer(many=True),
    )
    def get(self, request: Request):
        items = active_sprints_for_user(request.user, get_project_id(request))
        return Response(
            SprintSerializer(items, many=True, context={"request": request}).data
        )


class DashboardMyTasksView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination

    @extend_schema(
        summary="List my open tasks",
        description="Lists assigned, unfinished tasks across the authenticated user's visible projects.",
        parameters=[DashboardQuerySerializer],
        responses=PaginatedTaskSerializer,
    )
    def get(self, request: Request):
        items = my_tasks_for_user(request.user, get_project_id(request))
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(items, request, view=self)
        data = TaskSerializer(page, many=True, context={"request": request}).data
        return paginator.get_paginated_response(data)


class DashboardProjectHealthView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        summary="Get project health",
        description="Returns task completion and active sprint metrics per visible project.",
        parameters=[DashboardQuerySerializer],
        responses=ProjectHealthSerializer(many=True),
    )
    def get(self, request: Request):
        return Response(
            ProjectHealthSerializer(
                project_health_for_user(request.user, get_project_id(request)),
                many=True,
            ).data
        )


class DashboardActivityView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from dashboard.services import scoped_projects
        from tasks.models import TaskHistory

        projects = scoped_projects(request.user, get_project_id(request))
        if request.query_params.get("current_projects") == "true":
            projects = projects.exclude(status="archived")
        items = TaskHistory.objects.filter(task__project__in=projects)
        if request.query_params.get("mine") == "true":
            items = items.filter(task__assignee=request.user)
        items = items.select_related("task", "task__project", "actor")[:20]
        return Response(
            [
                {
                    "id": item.id,
                    "task_id": item.task_id,
                    "project_id": item.task.project_id,
                    "project_name": item.task.project.name,
                    "title": item.task.title,
                    "action": item.action,
                    "actor": item.actor.get_full_name() or item.actor.email
                    if item.actor
                    else "Former user",
                    "created_at": item.created_at,
                }
                for item in items
            ]
        )


class CalendarEventsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from datetime import date, timedelta
        from rest_framework import serializers
        from dashboard.services import scoped_projects
        from tasks.models import Task, Sprint
        from projects.models import PlanningItem
        from accounts.organizations import require_organization

        today = date.today()
        try:
            start = date.fromisoformat(
                request.query_params.get("start", today.replace(day=1).isoformat())
            )
            end = date.fromisoformat(
                request.query_params.get(
                    "end", (start + timedelta(days=42)).isoformat()
                )
            )
        except ValueError:
            raise serializers.ValidationError({"start": "Use ISO dates."})
        if end < start or (end - start).days > 93:
            raise serializers.ValidationError(
                {"end": "Choose a date range of at most 93 days."}
            )
        projects = scoped_projects(request.user, get_project_id(request))
        tasks = Task.objects.filter(
            project__in=projects, due_date__range=(start, end)
        ).order_by("due_date", "id")
        events = [
            {
                "id": f"task-{task.id}",
                "title": task.title,
                "date": task.due_date,
                "kind": "task",
                "project_id": task.project_id,
            }
            for task in tasks
        ]
        for sprint in Sprint.objects.filter(project__in=projects):
            for label, day in (("start", sprint.start_date), ("end", sprint.end_date)):
                if day and start <= day <= end:
                    events.append(
                        {
                            "id": f"sprint-{sprint.id}-{label}",
                            "title": f"{sprint.name} · {label}",
                            "date": day,
                            "kind": "sprint",
                            "project_id": sprint.project_id,
                        }
                    )
        items = PlanningItem.objects.filter(
            organization_id=require_organization(request.user),
            target_date__range=(start, end),
        ).exclude(kind="template")
        if request.query_params.get("project_id"):
            items = items.filter(tasks__project__in=projects).distinct()
        events.extend(
            {
                "id": f"plan-{item.id}",
                "title": item.name,
                "date": item.target_date,
                "kind": item.kind,
                "project_id": None,
            }
            for item in items
        )
        return Response(sorted(events, key=lambda item: (item["date"], item["id"])))

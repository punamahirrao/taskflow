from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema

from common.pagination import StandardResultsPagination
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


class DashboardOverviewView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get dashboard overview", description="Returns project and task totals for the authenticated user's visible projects.", parameters=[DashboardQuerySerializer], responses=DashboardOverviewSerializer)
    def get(self, request: Request):
        return Response(DashboardOverviewSerializer(overview_for_user(request.user, get_project_id(request))).data)


class DashboardActiveSprintsView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="List active sprints", description="Lists active, open sprints in projects visible to the authenticated user.", parameters=[DashboardQuerySerializer], responses=SprintSerializer(many=True))
    def get(self, request: Request):
        items = active_sprints_for_user(request.user, get_project_id(request))
        return Response(SprintSerializer(items, many=True, context={"request": request}).data)


class DashboardMyTasksView(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsPagination

    @extend_schema(summary="List my open tasks", description="Lists assigned, unfinished tasks across the authenticated user's visible projects.", parameters=[DashboardQuerySerializer], responses=PaginatedTaskSerializer)
    def get(self, request: Request):
        items = my_tasks_for_user(request.user, get_project_id(request))
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(items, request, view=self)
        data = TaskSerializer(page, many=True, context={"request": request}).data
        return paginator.get_paginated_response(data)


class DashboardProjectHealthView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(summary="Get project health", description="Returns task completion and active sprint metrics per visible project.", parameters=[DashboardQuerySerializer], responses=ProjectHealthSerializer(many=True))
    def get(self, request: Request):
        return Response(ProjectHealthSerializer(project_health_for_user(request.user, get_project_id(request)), many=True).data)

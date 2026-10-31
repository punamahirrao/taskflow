from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.db.models import Q
from django.utils import timezone
from projects.access import EDIT_PROJECT_ROLES, WRITE_TASK_ROLES, get_role, visible_projects
from projects.models import ProjectMembership
from tasks.models import BoardColumn, Sprint, Task
from tasks.permissions import NO_WRITE_PERMISSION
from tasks.serializers import TaskSerializer


class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get("project_id")
        projects = visible_projects(request.user)
        if project_id:
            if not project_id.isdigit():
                return Response({"detail": "A valid project_id is required"}, status=status.HTTP_400_BAD_REQUEST)
            project = get_object_or_404(projects, id=project_id)
            ensure_default_columns(project)
            tasks = Task.objects.filter(project=project)
        else:
            for project in projects:
                ensure_default_columns(project)
            tasks = Task.objects.filter(project__in=projects)
        sprint_id = request.query_params.get("sprint_id")
        if sprint_id == "active":
            tasks = tasks.filter(sprint__is_active=True)
        elif sprint_id and sprint_id.isdigit():
            tasks = tasks.filter(sprint_id=sprint_id)
        tasks = tasks.select_related("project", "assignee", "sprint").order_by("project_id", "rank", "created_at")

        serializer = TaskSerializer(tasks, many=True, context={"request": request})
        return Response(serializer.data)

    def post(self, request):
        serializer = TaskSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        accessible_projects = visible_projects(request.user)
        project = get_object_or_404(
            accessible_projects,
            id=serializer.validated_data["project_id"],
        )

        if get_role(request.user, project) not in WRITE_TASK_ROLES:
            return Response(NO_WRITE_PERMISSION, status=status.HTTP_403_FORBIDDEN)

        ensure_default_columns(project)
        if serializer.validated_data.get("status", "backlog") not in project.board_columns.values_list("key", flat=True):
            return Response({"status": "Choose a column configured for this project."}, status=status.HTTP_400_BAD_REQUEST)
        assignee = serializer.validated_data.get("assignee")
        if assignee and not ProjectMembership.objects.filter(project=project, user=assignee).filter(
            Q(removal_date__isnull=True) | Q(removal_date__gt=timezone.localdate())
        ).exists():
            return Response({"assignee": "Choose a current member of this project."}, status=status.HTTP_400_BAD_REQUEST)
        sprint = serializer.validated_data.get("sprint")
        if sprint and sprint.project_id != project.id:
            return Response({"sprint": "Choose a sprint from this project."}, status=status.HTTP_400_BAD_REQUEST)
        dependencies = serializer.validated_data.get("blocked_by", [])
        if dependencies and Task.objects.filter(id__in=[item.id for item in dependencies], project__in=accessible_projects).count() != len(dependencies):
            return Response({"blocked_by": "Dependencies must be work items in projects you can access."}, status=status.HTTP_400_BAD_REQUEST)
        parent = serializer.validated_data.get("parent")
        if parent and (parent.project_id != project.id or parent.work_type not in ("epic", "initiative")):
            return Response({"parent": "Choose an epic or initiative from this project."}, status=status.HTTP_400_BAD_REQUEST)

        task = serializer.save(project=project, created_by=request.user, blocked_since=timezone.now() if serializer.validated_data.get("blocked") else None)

        return Response(TaskSerializer(task, context={"request": request}).data, status=status.HTTP_201_CREATED)


DEFAULT_COLUMNS = (("backlog", "Backlog"), ("todo", "To Do"), ("in_progress", "In Progress"), ("review", "Review"), ("done", "Done"))


def ensure_default_columns(project):
    if project.board_columns.exists():
        return
    for position, (key, name) in enumerate(DEFAULT_COLUMNS):
        BoardColumn.objects.get_or_create(
            project=project,
            key=key,
            defaults={"name": name, "position": position},
        )

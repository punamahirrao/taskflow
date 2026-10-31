from django.utils.text import slugify
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models import F
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import EDIT_PROJECT_ROLES, get_role, visible_projects
from tasks.models import BoardColumn, Sprint, Task
from tasks.serializers import BoardColumnSerializer, SprintSerializer
from tasks.views.list_create import ensure_default_columns


class ProjectBoardColumnsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        ensure_default_columns(project)
        return Response(BoardColumnSerializer(project.board_columns.all(), many=True).data)

    def post(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can update board columns."}, status=status.HTTP_403_FORBIDDEN)
        name = str(request.data.get("name", "")).strip()
        if not name:
            return Response({"name": "Enter a column name."}, status=status.HTTP_400_BAD_REQUEST)
        key = slugify(name).replace("-", "_")[:40]
        if not key or project.board_columns.filter(key=key).exists():
            return Response({"name": "That column already exists."}, status=status.HTTP_400_BAD_REQUEST)
        column = BoardColumn.objects.create(
            project=project,
            name=name[:80],
            key=key,
            position=project.board_columns.count(),
            wip_limit=request.data.get("wip_limit") or None,
        )
        return Response(BoardColumnSerializer(column).data, status=status.HTTP_201_CREATED)


class ProjectBoardColumnDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, project_id, column_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can update board columns."}, status=status.HTTP_403_FORBIDDEN)
        column = get_object_or_404(BoardColumn, project=project, id=column_id)
        serializer = BoardColumnSerializer(column, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class SprintListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = visible_projects(request.user)
        project_id = request.query_params.get("project_id")
        if project_id:
            projects = projects.filter(id=project_id)
        return Response(SprintSerializer(Sprint.objects.filter(project__in=projects), many=True).data)

    def post(self, request):
        project = get_object_or_404(visible_projects(request.user), id=request.data.get("project_id"))
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can create a sprint."}, status=status.HTTP_403_FORBIDDEN)
        serializer = SprintSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get("is_active"):
            if Sprint.objects.filter(project=project, is_active=True).exists():
                return Response({"detail": "Close the active sprint before starting another."}, status=status.HTTP_409_CONFLICT)
        sprint = serializer.save(project=project)
        return Response(SprintSerializer(sprint).data, status=status.HTTP_201_CREATED)


class SprintDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, sprint_id):
        sprint = get_object_or_404(Sprint.objects.filter(project__in=visible_projects(request.user)), id=sprint_id)
        if get_role(request.user, sprint.project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can update a sprint."}, status=status.HTTP_403_FORBIDDEN)
        serializer = SprintSerializer(sprint, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get("is_active"):
            if sprint.is_closed:
                return Response({"detail": "A closed sprint cannot be restarted."}, status=status.HTTP_400_BAD_REQUEST)
            if Sprint.objects.filter(project=sprint.project, is_active=True).exclude(id=sprint.id).exists():
                return Response({"detail": "Close the active sprint before starting another."}, status=status.HTTP_409_CONFLICT)
        serializer.save()
        return Response(serializer.data)


class SprintCloseView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, sprint_id):
        sprint = get_object_or_404(Sprint.objects.select_for_update().filter(project__in=visible_projects(request.user)), id=sprint_id)
        if get_role(request.user, sprint.project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can close a sprint."}, status=status.HTTP_403_FORBIDDEN)
        if sprint.is_closed:
            return Response({"detail": "This sprint is already closed."}, status=status.HTTP_400_BAD_REQUEST)
        if not sprint.is_active:
            return Response({"detail": "Only the active sprint can be closed."}, status=status.HTTP_400_BAD_REQUEST)

        next_sprint = Sprint.objects.select_for_update().filter(
            project=sprint.project,
            is_active=False,
            is_closed=False,
        ).exclude(id=sprint.id).order_by(F("start_date").asc(nulls_last=True), "id").first()
        unfinished = list(sprint.tasks.exclude(status="done").order_by("rank", "created_at"))
        completed = list(sprint.tasks.filter(status="done"))
        velocity = sum(estimate_points(task.estimate) for task in completed)
        sprint.is_active = False
        sprint.is_closed = True
        sprint.velocity_points = velocity
        sprint.save(update_fields=["is_active", "is_closed", "velocity_points"])

        if next_sprint:
            next_sprint.is_active = True
            next_sprint.save(update_fields=["is_active"])
            for task in unfinished:
                task.sprint = next_sprint
                if task.status == "backlog":
                    task.status = "todo"
                task.save(update_fields=["sprint", "status", "updated_at"])
            destination = next_sprint.name
        else:
            task_ids = [task.id for task in unfinished]
            Task.objects.filter(project=sprint.project, status="backlog", sprint__isnull=True).exclude(id__in=task_ids).update(rank=F("rank") + len(unfinished))
            for rank, task in enumerate(unfinished):
                task.sprint = None
                task.status = "backlog"
                task.rank = rank
                task.started_at = None
                task.completed_at = None
                task.save(update_fields=["sprint", "status", "rank", "started_at", "completed_at", "updated_at"])
            destination = "the top of the backlog"

        if not sprint.outcome_summary:
            sprint.outcome_summary = f"Completed {len(completed)} of {len(completed) + len(unfinished)} sprint items and delivered {velocity} estimated points."
            sprint.save(update_fields=["outcome_summary"])

        return Response({
            "sprint": SprintSerializer(sprint).data,
            "next_sprint": SprintSerializer(next_sprint).data if next_sprint else None,
            "moved_count": len(unfinished),
            "message": f"{len(unfinished)} unfinished item(s) moved to {destination}.",
        })


def estimate_points(value):
    try:
        return max(0, int(float(value)))
    except (TypeError, ValueError):
        return 0

from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import (
    DELETE_ANY_TASK_ROLES,
    MEMBER,
    WRITE_TASK_ROLES,
    get_role,
    visible_projects,
)
from projects.models import ProjectMembership
from tasks.models import Task
from tasks.permissions import NO_WRITE_PERMISSION
from tasks.serializers import TaskSerializer
from tasks.models import Sprint


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_task(self, task_id, user):
        return get_object_or_404(
            Task.objects.select_related("project").filter(
                project__in=visible_projects(user)
            ),
            id=task_id,
        )

    def patch(self, request, task_id):
        task = self.get_task(task_id, request.user)

        if get_role(request.user, task.project) not in WRITE_TASK_ROLES:
            return Response(NO_WRITE_PERMISSION, status=status.HTTP_403_FORBIDDEN)

        if "project_id" in request.data:
            return Response(
                {"project_id": "Changing a task's project is not supported."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = TaskSerializer(
            task,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        serializer.is_valid(raise_exception=True)
        if "status" in serializer.validated_data:
            valid_statuses = task.project.board_columns.values_list("key", flat=True)
            if not valid_statuses.exists():
                from tasks.views.list_create import ensure_default_columns
                ensure_default_columns(task.project)
                valid_statuses = task.project.board_columns.values_list("key", flat=True)
            if serializer.validated_data["status"] not in valid_statuses:
                return Response({"status": "Choose a column configured for this project."}, status=status.HTTP_400_BAD_REQUEST)
        if "assignee" in serializer.validated_data and serializer.validated_data["assignee"] and serializer.validated_data["assignee"].id != task.assignee_id:
            has_access = ProjectMembership.objects.filter(
                project=task.project,
                user=serializer.validated_data["assignee"],
            ).filter(Q(removal_date__isnull=True) | Q(removal_date__gt=timezone.localdate())).exists()
            if not has_access:
                return Response({"assignee": "Choose a current member of this project."}, status=status.HTTP_400_BAD_REQUEST)
        sprint = serializer.validated_data.get("sprint")
        if sprint and sprint.project_id != task.project_id:
            return Response({"sprint": "Choose a sprint from this project."}, status=status.HTTP_400_BAD_REQUEST)
        dependencies = serializer.validated_data.get("blocked_by", [])
        if dependencies and (
            any(item.id == task.id for item in dependencies)
            or Task.objects.filter(id__in=[item.id for item in dependencies], project__in=visible_projects(request.user)).count() != len(dependencies)
        ):
            return Response({"blocked_by": "Choose other work items in projects you can access as dependencies."}, status=status.HTTP_400_BAD_REQUEST)
        parent = serializer.validated_data.get("parent")
        if parent and (
            parent.id == task.id
            or parent.project_id != task.project_id
            or parent.work_type not in ("epic", "initiative")
        ):
            return Response({"parent": "Choose another epic or initiative from this project."}, status=status.HTTP_400_BAD_REQUEST)
        next_status = serializer.validated_data.get("status", task.status)
        timestamp = timezone.now()
        if "blocked" in serializer.validated_data and serializer.validated_data["blocked"] != task.blocked:
            serializer.validated_data["blocked_since"] = timestamp if serializer.validated_data["blocked"] else None
        if next_status == "backlog":
            serializer.validated_data["sprint"] = None
            task.started_at = None
            task.completed_at = None
            task.save(update_fields=["started_at", "completed_at"])
        elif next_status != task.status:
            if next_status == "done":
                task.completed_at = timestamp
            elif task.status == "done":
                task.completed_at = None
            if task.status in ("backlog", "todo") and next_status in ("in_progress", "review") and task.started_at is None:
                task.started_at = timestamp
            task.save(update_fields=["started_at", "completed_at"])
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, task_id):
        task = self.get_task(task_id, request.user)
        role = get_role(request.user, task.project)

        can_delete = role in DELETE_ANY_TASK_ROLES or (
            role == MEMBER and task.created_by_id == request.user.id
        )
        if not can_delete:
            return Response(
                {"detail": "You are not allowed to delete this task."},
                status=status.HTTP_403_FORBIDDEN,
            )

        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

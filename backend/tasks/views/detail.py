from django.shortcuts import get_object_or_404
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
from tasks.models import Task
from tasks.permissions import NO_WRITE_PERMISSION
from tasks.serializers import TaskSerializer


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

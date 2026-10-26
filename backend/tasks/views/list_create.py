from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import WRITE_TASK_ROLES, get_role, visible_projects
from tasks.models import Task
from tasks.permissions import NO_WRITE_PERMISSION
from tasks.serializers import TaskSerializer


class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get("project_id")
        if not project_id or not project_id.isdigit():
            return Response(
                {"detail": "A valid project_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        project = get_object_or_404(visible_projects(request.user), id=project_id)
        tasks = Task.objects.filter(project=project).order_by("created_at")

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TaskSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)

        project = get_object_or_404(
            visible_projects(request.user),
            id=serializer.validated_data["project_id"],
        )

        if get_role(request.user, project) not in WRITE_TASK_ROLES:
            return Response(NO_WRITE_PERMISSION, status=status.HTTP_403_FORBIDDEN)

        task = serializer.save(project=project, created_by=request.user)

        return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)

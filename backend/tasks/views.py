from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from tasks.models import Task
from tasks.serializers import TaskSerializer
from django.shortcuts import get_object_or_404
from projects.access import (
    DELETE_ANY_TASK_ROLES,
    MEMBER,
    WRITE_TASK_ROLES,
    get_role,
    visible_projects,
)

NO_WRITE_PERMISSION = {"detail": "Your role on this project is read-only."}


class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get("project_id")
        if not project_id or not project_id.isdigit():
            return Response({"detail": "A valid project_id is required"}, status=400)

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
            return Response(NO_WRITE_PERMISSION, status=403)

        task = serializer.save(project=project, created_by=request.user)

        return Response(TaskSerializer(task).data, status=201)


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
            return Response(NO_WRITE_PERMISSION, status=403)

        if "project_id" in request.data:
            return Response(
                {"project_id": "Changing a task's project is not supported."},
                status=400,
            )

        serializer = TaskSerializer(
            task,
            data=request.data,
            partial=True,
            context={"request": request},
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)

    def delete(self, request, task_id):
        task = self.get_task(task_id, request.user)
        role = get_role(request.user, task.project)

        can_delete = role in DELETE_ANY_TASK_ROLES or (
            role == MEMBER and task.created_by_id == request.user.id
        )
        if not can_delete:
            return Response(
                {"detail": "You are not allowed to delete this task."},
                status=403,
            )

        task.delete()
        return Response(status=204)
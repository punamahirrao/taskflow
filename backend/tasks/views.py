from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from tasks.models import Task
from tasks.serializers import TaskSerializer
from django.shortcuts import get_object_or_404

class TaskListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get("project_id")
        if not project_id:
            return Response({"detail": "project_id is required"}, status=400)

        tasks = Task.objects.filter(
            project_id=project_id,
            created_by=request.user
        ).order_by("created_at")

        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TaskSerializer(data=request.data, context={"request": request})

        if serializer.is_valid():
            task = serializer.save()
            return Response(TaskSerializer(task).data, status=201)

        return Response(serializer.errors, status=400)


class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_task(self, task_id, user):
        return get_object_or_404(
            Task,
            id=task_id,
            created_by=user,
        )

    def patch(self, request, task_id):
        task = self.get_task(task_id, request.user)

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
        task.delete()
        return Response(status=204)    
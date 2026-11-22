from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import visible_projects
from tasks.models import Task, TaskHistory
from tasks.serializers import TaskHistorySerializer


class TaskHistoryListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id):
        task = get_object_or_404(
            Task.objects.filter(project__in=visible_projects(request.user)), id=task_id
        )
        entries = TaskHistory.objects.filter(task=task).select_related("actor")
        return Response(TaskHistorySerializer(entries, many=True).data)

from rest_framework import serializers

from projects.serializers import ProjectSerializer
from tasks.serializers import SprintSerializer, TaskSerializer


class DashboardOverviewSerializer(serializers.Serializer):
    total_projects = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    pending_tasks = serializers.IntegerField()
    completion_rate = serializers.IntegerField()
    active_sprints = serializers.IntegerField()


class DashboardQuerySerializer(serializers.Serializer):
    project_id = serializers.IntegerField(required=False, min_value=1)


class ProjectHealthSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    status = serializers.CharField()
    task_count = serializers.IntegerField()
    completed_tasks = serializers.IntegerField()
    completion_rate = serializers.IntegerField()
    active_sprints = serializers.IntegerField()


class DashboardPayloadSerializer(serializers.Serializer):
    projects = ProjectSerializer(many=True)
    tasks = TaskSerializer(many=True)
    sprints = SprintSerializer(many=True)


class PaginatedTaskSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)
    results = TaskSerializer(many=True)

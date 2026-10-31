from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.urls import reverse

from tasks.models import BoardColumn, Sprint, Task

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(write_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)
    assignee = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), allow_null=True, required=False)
    assignee_name = serializers.SerializerMethodField()
    assignee_photo_url = serializers.SerializerMethodField()
    sprint_name = serializers.CharField(source="sprint.name", read_only=True, allow_null=True)
    sprint_goal = serializers.CharField(source="sprint.goal", read_only=True, allow_null=True)
    parent_title = serializers.CharField(source="parent.title", read_only=True, allow_null=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "project",
            "project_id",
            "title",
            "description",
            "status",
            "work_type",
            "priority",
            "estimate",
            "tags",
            "rank",
            "due_date",
            "blocked",
            "blocked_since",
            "escalated",
            "blocked_by",
            "definition_done",
            "parent",
            "parent_title",
            "ready_for_sprint",
            "assignee",
            "assignee_name",
            "assignee_photo_url",
            "sprint",
            "sprint_name",
            "sprint_goal",
            "project_name",
            "created_by",
            "created_at",
            "updated_at",
            "started_at",
            "completed_at",
        )
        read_only_fields = ("id", "project", "created_by", "created_at", "updated_at", "started_at", "completed_at", "blocked_since", "project_name", "assignee_name", "assignee_photo_url", "sprint_name", "sprint_goal", "parent_title")

    def create(self, validated_data):
        validated_data.pop("project_id", None)
        dependencies = validated_data.pop("blocked_by", [])
        task = Task.objects.create(**validated_data)
        task.blocked_by.set(dependencies)
        return task

    def get_assignee_name(self, task):
        if not task.assignee:
            return ""
        return task.assignee.get_full_name() or task.assignee.email

    def get_assignee_photo_url(self, task):
        if not task.assignee or not task.assignee.profile_photo:
            return None
        path = reverse("profile_photo", args=[task.assignee.profile_photo.name])
        request = self.context.get("request")
        return request.build_absolute_uri(path) if request else path


class BoardColumnSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardColumn
        fields = ("id", "name", "key", "position", "wip_limit")
        read_only_fields = ("id", "key")


class SprintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sprint
        fields = ("id", "project", "name", "start_date", "end_date", "is_active", "is_closed", "goal", "capacity_points", "velocity_points", "outcome_summary", "retrospective", "created_at")
        read_only_fields = ("id", "project", "is_closed", "created_at")

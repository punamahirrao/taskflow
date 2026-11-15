from rest_framework import serializers
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.urls import reverse

from projects.access import ADMIN, OWNER, get_role
from tasks.models import AgileBoard, BoardColumn, Sprint, Task, TaskComment, TaskHistory, WorkflowStatus

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

    def validate_status(self, value):
        if not WorkflowStatus.objects.filter(key=value).exists():
            raise serializers.ValidationError("Choose a status defined in the workflow.")
        return value

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
    status_order = serializers.SerializerMethodField()
    statuses = serializers.SerializerMethodField()

    class Meta:
        model = BoardColumn
        fields = ("id", "name", "key", "position", "status_order", "group_name", "wip_limit", "statuses")
        read_only_fields = ("id", "key")

    def get_status_order(self, column):
        assignment = column.status_assignments.select_related("status").order_by("position", "id").first()
        return assignment.status.position if assignment else column.position

    def get_statuses(self, column):
        return [
            {"id": assignment.status_id, "key": assignment.status.key, "name": assignment.status.name, "position": assignment.position}
            for assignment in column.status_assignments.select_related("status").order_by("position", "id")
        ]


class WorkflowStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStatus
        fields = ("id", "key", "name", "position", "is_system")
        read_only_fields = ("id", "key", "position", "is_system")


class AgileBoardSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    member_ids = serializers.PrimaryKeyRelatedField(source="members", many=True, queryset=User.objects.all(), required=False, write_only=True)
    members = serializers.SerializerMethodField()
    project_name = serializers.CharField(source="project.name", read_only=True)
    task_count = serializers.SerializerMethodField()
    sprint_count = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    can_manage = serializers.SerializerMethodField()

    class Meta:
        model = AgileBoard
        fields = ("id", "project", "project_name", "name", "description", "board_type", "owner", "owner_name", "members", "member_ids", "member_count", "task_count", "sprint_count", "is_archived", "can_manage", "created_at", "updated_at")
        read_only_fields = ("id", "project", "owner", "owner_name", "members", "member_count", "task_count", "sprint_count", "is_archived", "created_at", "updated_at")

    def get_owner_name(self, board):
        return board.owner.get_full_name() or board.owner.email

    def get_can_manage(self, board):
        request = self.context.get("request")
        return bool(request and (request.user.is_site_admin or board.owner_id == request.user.id or get_role(request.user, board.project) in (OWNER, ADMIN)))

    def get_members(self, board):
        users = {member.id: member for member in board.members.all()}
        users.setdefault(board.owner_id, board.owner)
        request = self.context.get("request")
        result = []
        for member in users.values():
            photo_url = None
            if member.profile_photo:
                photo_url = reverse("profile_photo", args=[member.profile_photo.name])
                if request:
                    photo_url = request.build_absolute_uri(photo_url)
            result.append({"id": member.id, "name": member.get_full_name() or member.email, "photo_url": photo_url})
        return result

    def get_member_count(self, board):
        return board.members.exclude(id=board.owner_id).count() + 1

    def get_task_count(self, board):
        return board.project.tasks.filter(Q(sprint__board=board) | Q(sprint__isnull=True)).count()

    def get_sprint_count(self, board):
        return board.sprints.count()


class SprintSerializer(serializers.ModelSerializer):
    board_name = serializers.CharField(source="board.name", read_only=True, allow_null=True)
    class Meta:
        model = Sprint
        fields = ("id", "project", "board", "board_name", "name", "start_date", "end_date", "is_active", "is_closed", "goal", "capacity_points", "velocity_points", "outcome_summary", "retrospective", "created_at")
        read_only_fields = ("id", "project", "board", "board_name", "is_closed", "created_at")


class TaskCommentSerializer(serializers.ModelSerializer):
    author_id = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()
    author_photo_url = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = TaskComment
        fields = ("id", "task", "author_id", "author_name", "author_photo_url", "content", "created_at", "updated_at", "can_edit", "can_delete")
        read_only_fields = ("id", "task", "author_id", "author_name", "author_photo_url", "created_at", "updated_at", "can_edit", "can_delete")

    def get_author_name(self, comment):
        if not comment.author:
            return "Former user"
        return comment.author.get_full_name() or comment.author.email

    def get_author_id(self, comment):
        return comment.author_id

    def get_author_photo_url(self, comment):
        if not comment.author or not comment.author.profile_photo:
            return None
        path = reverse("profile_photo", args=[comment.author.profile_photo.name])
        request = self.context.get("request")
        return request.build_absolute_uri(path) if request else path

    def _can_manage(self, comment):
        request = self.context.get("request")
        if not request:
            return False
        role = get_role(request.user, comment.task.project)
        return role in (OWNER, ADMIN) or comment.author_id == request.user.id

    def get_can_edit(self, comment):
        return self._can_manage(comment)

    def get_can_delete(self, comment):
        return self._can_manage(comment)


class TaskHistorySerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = TaskHistory
        fields = ("id", "actor_name", "action", "changes", "created_at")

    def get_actor_name(self, entry):
        if not entry.actor:
            return "Former user"
        return entry.actor.get_full_name() or entry.actor.email

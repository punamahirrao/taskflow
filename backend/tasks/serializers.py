from rest_framework import serializers
from django.db.models import Q
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from django.urls import reverse
from django.db import transaction

from projects.access import ADMIN, OWNER, get_role
from common.validators import (
    validate_board_name,
    validate_sprint_dates,
    validate_task_estimate,
)
from tasks.models import (
    AgileBoard,
    BoardColumn,
    Sprint,
    Task,
    TaskComment,
    TaskHistory,
    WorkflowStatus,
)
from tasks.services.tasks import sync_feature_stories

User = get_user_model()


class TaskSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(write_only=True)
    project_name = serializers.CharField(source="project.name", read_only=True)
    assignee = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), allow_null=True, required=False
    )
    assignee_name = serializers.SerializerMethodField()
    assignee_photo_url = serializers.SerializerMethodField()
    sprint_name = serializers.CharField(
        source="sprint.name", read_only=True, allow_null=True
    )
    sprint_goal = serializers.CharField(
        source="sprint.goal", read_only=True, allow_null=True
    )
    parent_title = serializers.CharField(
        source="parent.title", read_only=True, allow_null=True
    )
    roadmap_color = serializers.RegexField(
        r"\A#[0-9a-fA-F]{6}\Z", max_length=7, trim_whitespace=False, required=False
    )
    story_ids = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(), many=True, required=False, write_only=True
    )
    linked_stories = serializers.SerializerMethodField()
    story_progress = serializers.SerializerMethodField()

    def validate(self, attrs):
        from projects.access import visible_projects

        project_id = getattr(self.instance, "project_id", attrs.get("project_id"))
        for field in ("blocked_by", "related_tasks"):
            selected = attrs.get(field)
            if selected is not None:
                request = self.context.get("request")
                allowed = (
                    Task.objects.filter(project__in=visible_projects(request.user))
                    if request
                    else Task.objects.none()
                )
                ids = {item.pk for item in selected}
                if (self.instance and self.instance.pk in ids) or allowed.filter(
                    pk__in=ids
                ).count() != len(ids):
                    raise serializers.ValidationError(
                        {
                            field: "Choose other work items in accessible projects in this organization."
                        }
                    )
        parent = attrs.get("parent")
        if parent:
            seen = {self.instance.pk} if self.instance else set()
            ancestor = parent
            while ancestor:
                if ancestor.pk in seen:
                    raise serializers.ValidationError(
                        {"parent": "Parent relationships cannot form a cycle."}
                    )
                seen.add(ancestor.pk)
                ancestor = ancestor.parent
        start = attrs.get(
            "planned_start_date", getattr(self.instance, "planned_start_date", None)
        )
        end = attrs.get("due_date", getattr(self.instance, "due_date", None))
        if start and end and start > end:
            raise serializers.ValidationError(
                {"due_date": "Expected delivery must be on or after the planned start."}
            )
        stories = attrs.get("story_ids")
        if stories is not None:
            feature_id = getattr(self.instance, "pk", None)
            project_id = getattr(self.instance, "project_id", attrs.get("project_id"))
            work_type = attrs.get(
                "work_type", getattr(self.instance, "work_type", "task")
            )
            if stories and work_type not in ("epic", "initiative", "enhancement"):
                raise serializers.ValidationError(
                    {
                        "story_ids": "Link stories to an epic, initiative or feature enhancement."
                    }
                )
            if any(
                story.work_type != "story"
                or story.project_id != project_id
                or story.pk == feature_id
                or (story.parent_id is not None and story.parent_id != feature_id)
                for story in stories
            ):
                raise serializers.ValidationError(
                    {
                        "story_ids": "Choose unassigned user stories from this project, or stories already linked to this feature."
                    }
                )
        if self.instance and "blocked_by" in attrs:
            pending = {item.pk for item in attrs["blocked_by"]}
            visited = set()
            while pending:
                if self.instance.pk in pending:
                    raise serializers.ValidationError(
                        {
                            "blocked_by": "Dependencies cannot create a circular dependency."
                        }
                    )
                visited.update(pending)
                pending = (
                    set(
                        Task.objects.filter(pk__in=pending).values_list(
                            "blocked_by__pk", flat=True
                        )
                    )
                    - visited
                    - {None}
                )
        return attrs

    def validate_status(self, value):
        if not WorkflowStatus.objects.filter(key=value).exists():
            raise serializers.ValidationError(
                "Choose a status defined in the workflow."
            )
        return value

    def validate_estimate(self, value):
        try:
            validate_task_estimate(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error
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
            "planned_start_date",
            "roadmap_color",
            "story_ids",
            "linked_stories",
            "story_progress",
            "blocked",
            "blocked_since",
            "escalated",
            "blocked_by",
            "related_tasks",
            "definition_done",
            "parent",
            "parent_title",
            "ready_for_sprint",
            "is_wishlisted",
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
        read_only_fields = (
            "id",
            "project",
            "created_by",
            "created_at",
            "updated_at",
            "started_at",
            "completed_at",
            "blocked_since",
            "project_name",
            "assignee_name",
            "assignee_photo_url",
            "sprint_name",
            "sprint_goal",
            "parent_title",
        )

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("project_id", None)
        dependencies = validated_data.pop("blocked_by", [])
        related = validated_data.pop("related_tasks", [])
        stories = validated_data.pop("story_ids", None)
        task = Task.objects.create(**validated_data)
        task.blocked_by.set(dependencies)
        task.related_tasks.set(related)
        sync_feature_stories(task, stories)
        return task

    @transaction.atomic
    def update(self, instance, validated_data):
        stories = validated_data.pop("story_ids", None)
        task = super().update(instance, validated_data)
        sync_feature_stories(task, stories)
        self.__dict__.pop("_story_cache", None)
        return task

    def _stories(self, task):
        cache = self.__dict__.setdefault("_story_cache", {})
        if task.pk not in cache:
            cache[task.pk] = [
                story
                for story in task.children.all()
                if story.work_type == "story" and story.project_id == task.project_id
            ]
        return cache[task.pk]

    def get_linked_stories(self, task):
        return [
            {"id": story.pk, "title": story.title, "status": story.status}
            for story in self._stories(task)
        ]

    def get_story_progress(self, task):
        stories = self._stories(task)
        completed = sum(story.status == "done" for story in stories)
        return {
            "total": len(stories),
            "completed": completed,
            "percent": int(completed * 100 / len(stories) + 0.5) if stories else 0,
        }

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
        fields = (
            "id",
            "name",
            "key",
            "position",
            "status_order",
            "group_name",
            "wip_limit",
            "statuses",
        )
        read_only_fields = ("id", "key")

    def get_status_order(self, column):
        assignment = (
            column.status_assignments.select_related("status")
            .order_by("position", "id")
            .first()
        )
        return assignment.status.position if assignment else column.position

    def get_statuses(self, column):
        return [
            {
                "id": assignment.status_id,
                "key": assignment.status.key,
                "name": assignment.status.name,
                "position": assignment.position,
            }
            for assignment in column.status_assignments.select_related(
                "status"
            ).order_by("position", "id")
        ]


class WorkflowStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkflowStatus
        fields = ("id", "key", "name", "position", "is_system")
        read_only_fields = ("id", "key", "position", "is_system")


class AgileBoardSerializer(serializers.ModelSerializer):
    owner_name = serializers.SerializerMethodField()
    member_ids = serializers.PrimaryKeyRelatedField(
        source="members",
        many=True,
        queryset=User.objects.all(),
        required=False,
        write_only=True,
    )
    members = serializers.SerializerMethodField()
    project_name = serializers.CharField(source="project.name", read_only=True)
    task_count = serializers.SerializerMethodField()
    sprint_count = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    can_manage = serializers.SerializerMethodField()

    def validate_name(self, value):
        try:
            validate_board_name(value)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.messages) from error
        return value.strip()

    class Meta:
        model = AgileBoard
        fields = (
            "id",
            "project",
            "project_name",
            "name",
            "description",
            "board_type",
            "owner",
            "owner_name",
            "members",
            "member_ids",
            "member_count",
            "task_count",
            "sprint_count",
            "is_archived",
            "can_manage",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "id",
            "project",
            "owner",
            "owner_name",
            "members",
            "member_count",
            "task_count",
            "sprint_count",
            "is_archived",
            "created_at",
            "updated_at",
        )

    def get_owner_name(self, board):
        return board.owner.get_full_name() or board.owner.email

    def get_can_manage(self, board):
        request = self.context.get("request")
        return bool(
            request
            and (
                request.user.is_site_admin
                or board.owner_id == request.user.id
                or get_role(request.user, board.project) in (OWNER, ADMIN)
            )
        )

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
            result.append(
                {
                    "id": member.id,
                    "name": member.get_full_name() or member.email,
                    "photo_url": photo_url,
                }
            )
        return result

    def get_member_count(self, board):
        return board.members.exclude(id=board.owner_id).count() + 1

    def get_task_count(self, board):
        return board.project.tasks.filter(
            Q(sprint__board=board) | Q(sprint__isnull=True)
        ).count()

    def get_sprint_count(self, board):
        return board.sprints.count()


class SprintSerializer(serializers.ModelSerializer):
    can_manage = serializers.SerializerMethodField()
    board_name = serializers.CharField(
        source="board.name", read_only=True, allow_null=True
    )

    def get_can_manage(self, sprint):
        from tasks.permissions import CanManageSprint

        request = self.context.get("request")
        return bool(request and CanManageSprint().has_object_permission(request, None, sprint))

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        try:
            validate_sprint_dates(start_date, end_date)
        except DjangoValidationError as error:
            raise serializers.ValidationError(
                error.message_dict if hasattr(error, "message_dict") else error.messages
            ) from error
        return attrs

    class Meta:
        model = Sprint
        fields = (
            "id",
            "project",
            "board",
            "board_name",
            "name",
            "can_manage",
            "start_date",
            "end_date",
            "is_active",
            "is_closed",
            "goal",
            "capacity_points",
            "velocity_points",
            "outcome_summary",
            "retrospective",
            "created_at",
        )
        read_only_fields = (
            "id",
            "project",
            "board",
            "board_name",
            "is_closed",
            "created_at",
        )


class TaskCommentSerializer(serializers.ModelSerializer):
    author_id = serializers.SerializerMethodField()
    author_name = serializers.SerializerMethodField()
    author_photo_url = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()

    class Meta:
        model = TaskComment
        fields = (
            "id",
            "task",
            "author_id",
            "author_name",
            "author_photo_url",
            "content",
            "created_at",
            "updated_at",
            "can_edit",
            "can_delete",
        )
        read_only_fields = (
            "id",
            "task",
            "author_id",
            "author_name",
            "author_photo_url",
            "created_at",
            "updated_at",
            "can_edit",
            "can_delete",
        )

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

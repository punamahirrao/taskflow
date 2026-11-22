from django.db import transaction
from django.db.models import Case, IntegerField, When
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import WRITE_TASK_ROLES, get_role, visible_projects
from projects.models import Project
from tasks.models import Task, TaskHistory


class BacklogOrderInput(serializers.Serializer):
    project_id = serializers.IntegerField(min_value=1)
    task_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), min_length=2, max_length=1000
    )

    def validate_task_ids(self, value):
        if len(value) != len(set(value)):
            raise serializers.ValidationError("Each work item must appear only once.")
        return value


class BacklogReorderView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        data = BacklogOrderInput(data=request.data)
        data.is_valid(raise_exception=True)
        project = get_object_or_404(
            Project.objects.select_for_update().filter(pk__in=visible_projects(request.user)),
            pk=data.validated_data["project_id"],
        )
        if get_role(request.user, project) not in WRITE_TASK_ROLES:
            raise PermissionDenied("You do not have permission to reorder this backlog.")
        priority = Case(
            When(priority="urgent", then=0),
            When(priority="high", then=1),
            When(priority="medium", then=2),
            default=3,
            output_field=IntegerField(),
        )
        backlog = list(
            Task.objects.select_for_update()
            .filter(project=project, status="backlog")
            .order_by("rank", priority, "id")
        )
        by_id = {task.pk: task for task in backlog}
        ordered_ids = data.validated_data["task_ids"]
        if any(task_id not in by_id for task_id in ordered_ids):
            raise ValidationError(
                {"task_ids": "Choose current backlog items from this project. Refresh and try again."}
            )

        # Replace just the submitted slots, preserving tasks hidden by search/group filters.
        selected = set(ordered_ids)
        replacements = iter(by_id[task_id] for task_id in ordered_ids)
        ordered = [next(replacements) if task.pk in selected else task for task in backlog]
        changed, history = [], []
        timestamp = timezone.now()
        for rank, task in enumerate(ordered):
            if task.rank == rank:
                continue
            history.append(
                TaskHistory(
                    task=task,
                    actor=request.user,
                    action="updated",
                    changes={"rank": {"old": task.rank, "new": rank}},
                )
            )
            task.rank, task.updated_at = rank, timestamp
            changed.append(task)
        Task.objects.bulk_update(changed, ("rank", "updated_at"))
        TaskHistory.objects.bulk_create(history)
        return Response({"ranks": [{"id": task.pk, "rank": task.rank} for task in ordered]})

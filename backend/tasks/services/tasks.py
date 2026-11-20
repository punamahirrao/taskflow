from django.db import transaction
from django.utils import timezone

from tasks.models import Task, TaskHistory


@transaction.atomic
def create_task(*, project, actor, validated_data):
    values = dict(validated_data)
    values.pop("project_id", None)
    dependencies = values.pop("blocked_by", [])
    if values.get("blocked"):
        values["blocked_since"] = timezone.now()
    task = Task.objects.create(project=project, created_by=actor, **values)
    task.blocked_by.set(dependencies)
    TaskHistory.objects.create(
        task=task,
        actor=actor,
        action="created",
        changes={"title": {"new": task.title}, "status": {"new": task.status}},
    )
    return task

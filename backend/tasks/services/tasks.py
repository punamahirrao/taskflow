from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from tasks.models import Task, TaskHistory


def sync_feature_stories(feature, stories):
    if stories is None:
        return
    story_ids = [story.pk for story in stories]
    current_stories = list(
        Task.objects.select_for_update().filter(pk__in=story_ids).order_by("pk")
    )
    if any(
        story.project_id != feature.project_id
        or story.work_type != "story"
        or story.parent_id not in (None, feature.pk)
        for story in current_stories
    ):
        raise ValidationError(
            {
                "story_ids": "A selected story was assigned to another feature. Refresh and try again."
            }
        )
    Task.objects.filter(parent=feature, work_type="story").exclude(
        pk__in=story_ids
    ).update(parent=None)
    Task.objects.filter(pk__in=story_ids).update(parent=feature)
    getattr(feature, "_prefetched_objects_cache", {}).pop("children", None)


@transaction.atomic
def create_task(*, project, actor, validated_data):
    values = dict(validated_data)
    values.pop("project_id", None)
    dependencies = values.pop("blocked_by", [])
    related = values.pop("related_tasks", [])
    stories = values.pop("story_ids", None)
    if values.get("blocked"):
        values["blocked_since"] = timezone.now()
    task = Task.objects.create(project=project, created_by=actor, **values)
    task.blocked_by.set(dependencies)
    task.related_tasks.set(related)
    sync_feature_stories(task, stories)
    TaskHistory.objects.create(
        task=task,
        actor=actor,
        action="created",
        changes={"title": {"new": task.title}, "status": {"new": task.status}},
    )
    return task

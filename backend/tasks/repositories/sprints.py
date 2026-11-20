from django.db.models import QuerySet

from projects.access import visible_projects
from tasks.models import Sprint


def visible_sprints(user) -> QuerySet[Sprint]:
    """Return sprints in projects visible to the given user."""
    return Sprint.objects.filter(project__in=visible_projects(user))


def visible_sprint(user, sprint_id, *, for_update=False) -> QuerySet[Sprint]:
    """Build a user-scoped sprint query, optionally locking the selected row."""
    queryset = visible_sprints(user).select_related("project")
    if for_update:
        queryset = queryset.select_for_update()
    return queryset.filter(id=sprint_id)

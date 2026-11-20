from django.db.models import Q
from django.utils import timezone


def active_project_member_ids(project):
    """Fetch member ids eligible to be assigned to a project board."""
    return set(
        project.memberships.filter(
            Q(removal_date__isnull=True) | Q(removal_date__gt=timezone.localdate())
        ).values_list("user_id", flat=True)
    )

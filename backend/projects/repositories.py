from django.db.models import Q
from django.utils import timezone

from projects.models import ProjectMembership


def active_project_memberships(project):
    return project.memberships.select_related("user", "role").filter(
        Q(removal_date__isnull=True) | Q(removal_date__gt=timezone.localdate())
    )


def active_membership(project, user):
    return active_project_memberships(project).filter(user=user).first()

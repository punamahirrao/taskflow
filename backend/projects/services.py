from django.db import transaction
from rest_framework.exceptions import ValidationError

from projects.models import Project, ProjectMembership, ProjectRole


@transaction.atomic
def create_project(*, owner, validated_data):
    if (
        not owner.active_organization_id
        or not owner.organizations.filter(pk=owner.active_organization_id).exists()
    ):
        raise ValidationError({"detail": "Create or select an organization first."})
    project = Project.objects.create(
        organization_id=owner.active_organization_id, **validated_data
    )
    owner_role, _ = ProjectRole.objects.get_or_create(role_name=ProjectRole.OWNER)
    ProjectMembership.objects.create(project=project, user=owner, role=owner_role)
    return project


def set_default_project(*, user, project):
    from accounts.models import OrganizationMembership

    OrganizationMembership.objects.filter(
        user=user, organization_id=user.active_organization_id
    ).update(default_project=project)
    # Compatibility for older clients; organization membership is authoritative.
    user.default_project = project
    user.save(update_fields=["default_project"])
    return user.default_project_id

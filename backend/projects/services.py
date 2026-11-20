from django.db import transaction

from projects.models import Project, ProjectMembership, ProjectRole


@transaction.atomic
def create_project(*, owner, validated_data):
    project = Project.objects.create(**validated_data)
    owner_role, _ = ProjectRole.objects.get_or_create(role_name=ProjectRole.OWNER)
    ProjectMembership.objects.create(project=project, user=owner, role=owner_role)
    return project


def set_default_project(*, user, project):
    user.default_project = project
    user.save(update_fields=["default_project"])
    return user.default_project_id

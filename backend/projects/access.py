from .models import Project, ProjectMembership, ProjectRole

OWNER = ProjectRole.OWNER
ADMIN = ProjectRole.ADMIN
MEMBER = ProjectRole.MEMBER
VIEWER = ProjectRole.VIEWER

EDIT_PROJECT_ROLES = {OWNER, ADMIN}
WRITE_TASK_ROLES = {OWNER, ADMIN, MEMBER}
DELETE_ANY_TASK_ROLES = {OWNER, ADMIN}

# Which roles each role may hand out. The owner role is never assignable.
ASSIGNABLE_ROLES = {
    OWNER: {ADMIN, MEMBER, VIEWER},
    ADMIN: {MEMBER, VIEWER},
}


def visible_projects(user):
    if user.is_site_admin:
        return Project.objects.all()
    return Project.objects.filter(memberships__user=user).distinct()


def get_role(user, project):
    # Site admins act as owner on every project.
    if user.is_site_admin:
        return OWNER
    return (
        ProjectMembership.objects.filter(project=project, user=user)
        .values_list("role__role_name", flat=True)
        .first()
    )


def can_assign_role(actor_role, new_role):
    return new_role in ASSIGNABLE_ROLES.get(actor_role, set())


def can_change_member(actor_role, target_role, new_role=None):
    if target_role == OWNER:
        return False

    allowed = ASSIGNABLE_ROLES.get(actor_role, set())

    if target_role not in allowed:
        return False

    return new_role is None or new_role in allowed
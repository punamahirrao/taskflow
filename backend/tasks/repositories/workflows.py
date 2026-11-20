from django.db.models import Q

from tasks.models import BoardColumnStatus, WorkflowStatus


def available_statuses(project):
    project_statuses = WorkflowStatus.objects.filter(project=project)
    shadowed_keys = project_statuses.values_list("key", flat=True)
    return WorkflowStatus.objects.filter(
        Q(project=project)
        | (Q(project__isnull=True, is_system=True) & ~Q(key__in=shadowed_keys))
    ).order_by("position", "id")


def status_key_exists(project, key):
    return WorkflowStatus.objects.filter(
        Q(project__isnull=True) | Q(project=project), key=key
    ).exists()


def project_default_columns(project):
    return project.board_columns.filter(board__isnull=True).prefetch_related(
        "status_assignments__status"
    )


def status_for_project_or_default(project, key):
    return WorkflowStatus.objects.filter(
        Q(project=project) | Q(project__isnull=True, is_system=True), key=key
    ).first()


def append_status_assignment(column, status):
    position = column.status_assignments.count()
    return column.status_assignments.create(status=status, position=position)

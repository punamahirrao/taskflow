from django.db import transaction
from django.utils.text import slugify

from tasks.models import BoardColumn, BoardColumnStatus, WorkflowStatus
from tasks.repositories.workflows import (
    append_status_assignment,
    available_statuses as query_available_statuses,
    project_default_columns,
    status_for_project_or_default,
    status_key_exists,
)


DEFAULT_COLUMNS = (
    ("backlog", "Backlog", "Planning"),
    ("todo", "To Do", "Active work"),
    ("in_progress", "In Progress", "Active work"),
    ("review", "Review", "Quality"),
    ("waiting", "Waiting", "Waiting"),
    ("done", "Done", "Complete"),
)


@transaction.atomic
def ensure_default_columns(project):
    """Create the shared defaults and lazily repair legacy column mappings."""
    for position, (key, name, group_name) in enumerate(DEFAULT_COLUMNS):
        workflow_status, _ = WorkflowStatus.objects.get_or_create(
            project=None,
            key=key,
            defaults={"name": name, "position": position, "is_system": True},
        )
        column, _ = BoardColumn.objects.get_or_create(
            project=project,
            board=None,
            key=key,
            defaults={"name": name, "position": position, "group_name": group_name},
        )
        column.status_assignments.get_or_create(
            status=workflow_status, defaults={"position": 0}
        )

    for column in project.board_columns.filter(board__isnull=True):
        if column.status_assignments.exists():
            continue
        workflow_status = status_for_project_or_default(project, column.key)
        if workflow_status:
            column.status_assignments.get_or_create(
                status=workflow_status, defaults={"position": 0}
            )


def available_statuses(project):
    return query_available_statuses(project)


def unique_status_key(project, name):
    base = slugify(name).replace("-", "_")[:32] or "status"
    key = base
    suffix = 2
    while status_key_exists(project, key):
        key = f"{base[:35]}_{suffix}"[:40]
        suffix += 1
    return key


@transaction.atomic
def assign_status(project, status, column):
    BoardColumnStatus.objects.filter(
        column__project=project,
        column__board__isnull=True,
        status=status,
    ).delete()
    if column is not None:
        return append_status_assignment(column, status)
    return None


@transaction.atomic
def ensure_board_columns(board):
    """Copy project defaults to a board on first access, preserving each board's mappings."""
    if board.columns.exists():
        return
    ensure_default_columns(board.project)
    for column in project_default_columns(board.project):
        copy = BoardColumn.objects.create(
            project=board.project,
            board=board,
            name=column.name,
            key=column.key,
            position=column.position,
            group_name=column.group_name,
            wip_limit=column.wip_limit,
        )
        for assignment in column.status_assignments.all():
            BoardColumnStatus.objects.create(
                column=copy,
                status=assignment.status,
                position=assignment.position,
            )

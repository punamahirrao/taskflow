from django.db import transaction
from django.db.models import F

from common.exceptions import ValidationException
from tasks.models import AgileBoard, Sprint, Task, TaskHistory


class SprintStateError(ValidationException):
    """Raised when a sprint operation is invalid for the sprint's current state."""


def sync_sprint_board(sprint, owner):
    """Keep the optional board attached to an active sprint in sync."""
    if sprint.is_active and not sprint.is_closed:
        if sprint.board_id and not Sprint.objects.filter(board_id=sprint.board_id).exclude(id=sprint.id).exists():
            if sprint.board.name != sprint.name:
                sprint.board.name = sprint.name
                sprint.board.save(update_fields=["name", "updated_at"])
            return sprint.board
        board = AgileBoard.objects.create(
            project=sprint.project,
            name=sprint.name,
            description=f"Active sprint board for {sprint.name}.",
            board_type=AgileBoard.SCRUM,
            owner=owner,
        )
        board.members.add(owner)
        sprint.board = board
        sprint.save(update_fields=["board"])
        return board

    if sprint.board_id:
        board = sprint.board
        sprint.board = None
        sprint.save(update_fields=["board"])
        if not Sprint.objects.filter(board_id=board.id).exists():
            board.delete()
    return None


def estimate_points(value):
    try:
        return max(0, int(float(value)))
    except (TypeError, ValueError):
        return 0


@transaction.atomic
def close_sprint(sprint, actor):
    """Close an active sprint and return unfinished work to the project backlog."""
    sprint = Sprint.objects.select_for_update().select_related("project").get(pk=sprint.pk)
    if sprint.is_closed:
        raise SprintStateError("This sprint is already closed.")
    if not sprint.is_active:
        raise SprintStateError("Only the active sprint can be closed.")

    unfinished = list(sprint.tasks.exclude(status="done").order_by("rank", "created_at"))
    completed = list(sprint.tasks.filter(status="done"))
    velocity = sum(estimate_points(task.estimate) for task in completed)
    sprint.is_active, sprint.is_closed, sprint.velocity_points = False, True, velocity
    sprint.save(update_fields=["is_active", "is_closed", "velocity_points"])

    unfinished_ids = [task.id for task in unfinished]
    Task.objects.filter(project=sprint.project, status="backlog", sprint__isnull=True).exclude(
        id__in=unfinished_ids
    ).update(rank=F("rank") + len(unfinished))
    for rank, task in enumerate(unfinished):
        previous_sprint, previous_status = task.sprint_id, task.status
        task.sprint, task.status, task.rank = None, "backlog", rank
        task.started_at = task.completed_at = None
        task.save(update_fields=["sprint", "status", "rank", "started_at", "completed_at", "updated_at"])
        TaskHistory.objects.create(
            task=task,
            actor=actor,
            action="sprint_returned_to_backlog",
            changes={
                "sprint": {"old": previous_sprint, "new": None},
                "status": {"old": previous_status, "new": "backlog"},
                "rank": {"new": rank},
            },
        )

    board = sprint.board
    if board:
        sprint.board = None
        sprint.save(update_fields=["board"])
        if not Sprint.objects.filter(board_id=board.id).exists():
            board.delete()

    if not sprint.outcome_summary:
        sprint.outcome_summary = (
            f"Completed {len(completed)} of {len(completed) + len(unfinished)} sprint items "
            f"and delivered {velocity} estimated points."
        )
        sprint.save(update_fields=["outcome_summary"])

    return {
        "sprint": sprint,
        "next_sprint": None,
        "moved_count": len(unfinished),
        "message": f"{len(unfinished)} unfinished item(s) moved to the top of the backlog.",
    }

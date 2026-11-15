from django.db import transaction
from django.db.models import F
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import EDIT_PROJECT_ROLES, get_role, visible_projects
from tasks.models import Sprint, Task, TaskHistory
from tasks.serializers import SprintSerializer


class SprintCloseView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, sprint_id):
        sprint = get_object_or_404(Sprint.objects.select_for_update().filter(project__in=visible_projects(request.user)), id=sprint_id)
        if sprint.board_id and sprint.board.owner_id != request.user.id and not request.user.is_site_admin and get_role(request.user, sprint.project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only the board owner or project administrators can close this sprint."}, status=status.HTTP_403_FORBIDDEN)
        if get_role(request.user, sprint.project) not in EDIT_PROJECT_ROLES and (not sprint.board_id or sprint.board.owner_id != request.user.id):
            return Response({"detail": "Only owners and managers can close a sprint."}, status=status.HTTP_403_FORBIDDEN)
        if sprint.is_closed:
            return Response({"detail": "This sprint is already closed."}, status=status.HTTP_400_BAD_REQUEST)
        if not sprint.is_active:
            return Response({"detail": "Only the active sprint can be closed."}, status=status.HTTP_400_BAD_REQUEST)

        unfinished = list(sprint.tasks.exclude(status="done").order_by("rank", "created_at"))
        completed = list(sprint.tasks.filter(status="done"))
        velocity = sum(estimate_points(task.estimate) for task in completed)
        sprint.is_active, sprint.is_closed, sprint.velocity_points = False, True, velocity
        sprint.save(update_fields=["is_active", "is_closed", "velocity_points"])

        unfinished_ids = [task.id for task in unfinished]
        Task.objects.filter(project=sprint.project, status="backlog", sprint__isnull=True).exclude(id__in=unfinished_ids).update(rank=F("rank") + len(unfinished))
        for rank, task in enumerate(unfinished):
            previous_sprint, previous_status = task.sprint_id, task.status
            task.sprint, task.status, task.rank = None, "backlog", rank
            task.started_at = task.completed_at = None
            task.save(update_fields=["sprint", "status", "rank", "started_at", "completed_at", "updated_at"])
            TaskHistory.objects.create(task=task, actor=request.user, action="sprint_returned_to_backlog", changes={
                "sprint": {"old": previous_sprint, "new": None},
                "status": {"old": previous_status, "new": "backlog"},
                "rank": {"new": rank},
            })
        destination = "the top of the backlog"

        board = sprint.board
        if board:
            sprint.board = None
            sprint.save(update_fields=["board"])
            if not Sprint.objects.filter(board_id=board.id).exists():
                board.delete()

        if not sprint.outcome_summary:
            sprint.outcome_summary = f"Completed {len(completed)} of {len(completed) + len(unfinished)} sprint items and delivered {velocity} estimated points."
            sprint.save(update_fields=["outcome_summary"])
        return Response({
            "sprint": SprintSerializer(sprint).data,
            "next_sprint": None,
            "moved_count": len(unfinished),
            "message": f"{len(unfinished)} unfinished item(s) moved to {destination}.",
        })


def estimate_points(value):
    try:
        return max(0, int(float(value)))
    except (TypeError, ValueError):
        return 0

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
        if get_role(request.user, sprint.project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can close a sprint."}, status=status.HTTP_403_FORBIDDEN)
        if sprint.is_closed:
            return Response({"detail": "This sprint is already closed."}, status=status.HTTP_400_BAD_REQUEST)
        if not sprint.is_active:
            return Response({"detail": "Only the active sprint can be closed."}, status=status.HTTP_400_BAD_REQUEST)

        next_sprint = Sprint.objects.select_for_update().filter(project=sprint.project, is_active=False, is_closed=False).exclude(id=sprint.id).order_by(F("start_date").asc(nulls_last=True), "id").first()
        unfinished = list(sprint.tasks.exclude(status="done").order_by("rank", "created_at"))
        completed = list(sprint.tasks.filter(status="done"))
        velocity = sum(estimate_points(task.estimate) for task in completed)
        sprint.is_active, sprint.is_closed, sprint.velocity_points = False, True, velocity
        sprint.save(update_fields=["is_active", "is_closed", "velocity_points"])

        if next_sprint:
            next_sprint.is_active = True
            next_sprint.save(update_fields=["is_active"])
            for task in unfinished:
                previous_sprint, previous_status = task.sprint_id, task.status
                task.sprint = next_sprint
                if task.status == "backlog":
                    task.status = "todo"
                task.save(update_fields=["sprint", "status", "updated_at"])
                TaskHistory.objects.create(task=task, actor=request.user, action="sprint_rollover", changes={
                    "sprint": {"old": previous_sprint, "new": next_sprint.id},
                    "status": {"old": previous_status, "new": task.status},
                })
            destination = next_sprint.name
        else:
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

        if not sprint.outcome_summary:
            sprint.outcome_summary = f"Completed {len(completed)} of {len(completed) + len(unfinished)} sprint items and delivered {velocity} estimated points."
            sprint.save(update_fields=["outcome_summary"])
        return Response({
            "sprint": SprintSerializer(sprint).data,
            "next_sprint": SprintSerializer(next_sprint).data if next_sprint else None,
            "moved_count": len(unfinished),
            "message": f"{len(unfinished)} unfinished item(s) moved to {destination}.",
        })


def estimate_points(value):
    try:
        return max(0, int(float(value)))
    except (TypeError, ValueError):
        return 0

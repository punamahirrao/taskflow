from django.db import transaction
from django.db.models import Prefetch
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import AuditEvent
from accounts.organizations import (
    can_manage_organization,
    organization_users,
    require_organization,
)
from projects.access import visible_projects
from projects.models import PlanningItem, ReleaseApproval
from tasks.models import Task


class ApprovalInput(serializers.Serializer):
    name = serializers.CharField(max_length=100)
    approver_id = serializers.IntegerField(min_value=1)


class ReleaseInput(serializers.Serializer):
    name = serializers.CharField(max_length=160)
    description = serializers.CharField(
        max_length=10000, required=False, allow_blank=True
    )
    target_date = serializers.DateField(required=False, allow_null=True)
    task_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), max_length=500, required=False
    )
    goal_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1), max_length=100, required=False
    )
    steps = ApprovalInput(many=True, max_length=20, required=False)


class ReleaseAction(serializers.Serializer):
    action = serializers.ChoiceField(
        choices=("start", "approve", "request_changes", "resume", "finish", "reassign")
    )
    step_id = serializers.IntegerField(min_value=1, required=False)
    approver_id = serializers.IntegerField(min_value=1, required=False)
    note = serializers.CharField(max_length=2000, allow_blank=True, default="")


def require_manager(user):
    if not can_manage_organization(user):
        raise PermissionDenied("Only organization administrators can manage releases.")


def visible_tasks(user):
    return Task.objects.filter(project__in=visible_projects(user))


def read_releases(user, org_id):
    return PlanningItem.objects.filter(
        organization_id=org_id, kind="release"
    ).prefetch_related(
        Prefetch("tasks", queryset=visible_tasks(user).select_related("project")),
        "release_goals",
        Prefetch(
            "approval_steps",
            queryset=ReleaseApproval.objects.select_related("approver"),
        ),
    )


def workflow_state(release, steps):
    step = next(
        (item for item in steps if item.status != ReleaseApproval.Status.APPROVED), None
    )
    if release.status == "done":
        return "done", None
    if release.status == "planned" or not steps:
        return release.status, None
    if step is None:
        return "ready", None
    if step.status == ReleaseApproval.Status.CHANGES_REQUESTED:
        return "changes_requested", step
    return "in_progress", step


def release_json(release, user):
    steps = list(release.approval_steps.all())
    state, active = workflow_state(release, steps)
    return {
        "id": release.id,
        "name": release.name,
        "description": release.description,
        "target_date": release.target_date,
        "status": release.status,
        "state": state,
        "active_step_id": active.id if active else None,
        "goals": [
            {"id": goal.id, "name": goal.name, "status": goal.status}
            for goal in release.release_goals.all()
        ],
        "tasks": [
            {
                "id": task.id,
                "title": task.title,
                "status": task.status,
                "project_id": task.project_id,
                "project_name": task.project.name,
            }
            for task in release.tasks.all()
        ],
        "steps": [
            {
                "id": step.id,
                "name": step.name,
                "approver_id": step.approver_id,
                "approver_name": (step.approver.get_full_name() or step.approver.email)
                if step.approver
                else None,
                "status": "in_progress"
                if step == active and state == "in_progress"
                else step.status,
                "note": step.note,
                "decided_at": step.decided_at,
                "can_decide": step == active
                and state == "in_progress"
                and step.approver_id == user.id,
            }
            for step in steps
        ],
    }


def save_release(release, fields, user, org_id):
    task_ids = fields.pop("task_ids", None)
    goal_ids = fields.pop("goal_ids", None)
    steps = fields.pop("steps", None)
    if task_ids is not None and visible_tasks(user).filter(
        pk__in=task_ids
    ).count() != len(set(task_ids)):
        raise ValidationError(
            {"task_ids": "Choose work items you can access in this organization."}
        )
    goals = PlanningItem.objects.filter(
        organization_id=org_id, kind="goal", pk__in=goal_ids or []
    )
    if goal_ids is not None and goals.count() != len(set(goal_ids)):
        raise ValidationError({"goal_ids": "Choose goals from this organization."})
    if steps is not None:
        approver_ids = {step["approver_id"] for step in steps}
        if organization_users(user).filter(
            pk__in=approver_ids, is_active=True
        ).count() != len(approver_ids):
            raise ValidationError(
                {"steps": "Choose active approvers from this organization."}
            )
        if steps and release.status == "in_progress":
            release.status = "planned"

    for field, value in fields.items():
        setattr(release, field, value)
    release.save()
    if task_ids is not None:
        hidden = release.tasks.exclude(
            pk__in=visible_tasks(user).values("pk")
        ).values_list("pk", flat=True)
        release.tasks.set(set(task_ids).union(hidden))
    if goal_ids is not None:
        release.release_goals.set(goals)
    if steps is not None:
        release.approval_steps.all().delete()
        ReleaseApproval.objects.bulk_create(
            [
                ReleaseApproval(release=release, position=position, **step)
                for position, step in enumerate(steps, start=1)
            ]
        )


class ReleasesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        org_id = require_organization(user)
        releases = read_releases(user, org_id)
        mine = request.query_params.get("mine") == "true"
        if mine:
            releases = releases.filter(approval_steps__approver=user).distinct()
        can_manage = can_manage_organization(user)
        members = []
        goals = []
        if can_manage and not mine:
            members = [
                {"id": member.id, "name": member.get_full_name() or member.email}
                for member in organization_users(user)
                .filter(is_active=True)
                .order_by("first_name", "last_name", "id")
            ]
            goals = list(
                PlanningItem.objects.filter(organization_id=org_id, kind="goal").values(
                    "id", "name", "status"
                )
            )
        return Response(
            {
                "items": [release_json(item, user) for item in releases],
                "can_manage": can_manage,
                "members": members,
                "goals": goals,
            }
        )

    @transaction.atomic
    def post(self, request):
        require_manager(request.user)
        org_id = require_organization(request.user)
        data = ReleaseInput(data=request.data)
        data.is_valid(raise_exception=True)
        release = PlanningItem(
            organization_id=org_id, kind="release", created_by=request.user
        )
        save_release(release, data.validated_data, request.user, org_id)
        return Response(
            release_json(
                read_releases(request.user, org_id).get(pk=release.id), request.user
            ),
            status=201,
        )


class ReleaseDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, pk):
        require_manager(request.user)
        org_id = require_organization(request.user)
        release = get_object_or_404(
            PlanningItem.objects.select_for_update(),
            pk=pk,
            organization_id=org_id,
            kind="release",
        )
        if release.status == "done" or (
            release.status == "in_progress" and release.approval_steps.exists()
        ):
            raise ValidationError(
                {
                    "detail": "Release scope and approval order are locked after review starts."
                }
            )
        data = ReleaseInput(data=request.data, partial=True)
        data.is_valid(raise_exception=True)
        save_release(release, data.validated_data, request.user, org_id)
        return Response(
            release_json(read_releases(request.user, org_id).get(pk=pk), request.user)
        )


class ReleaseActionView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        user = request.user
        org_id = require_organization(user)
        release = get_object_or_404(
            PlanningItem.objects.select_for_update(),
            pk=pk,
            organization_id=org_id,
            kind="release",
        )
        data = ReleaseAction(data=request.data)
        data.is_valid(raise_exception=True)
        action = data.validated_data["action"]
        steps = list(release.approval_steps.all())
        state, active = workflow_state(release, steps)
        step_id = data.validated_data.get("step_id")
        step = next((item for item in steps if item.id == step_id), None)
        note = data.validated_data["note"]
        if action not in ("approve", "request_changes"):
            require_manager(user)

        if action in ("approve", "request_changes"):
            if state != "in_progress" or active is None or step != active:
                raise ValidationError(
                    {"detail": "This approval step is no longer awaiting review."}
                )
            if active.approver_id != user.id:
                raise PermissionDenied(
                    "Only the assigned approver can decide this step."
                )
            if action == "request_changes" and not note:
                raise ValidationError({"note": "Explain what needs to change."})
            active.status = (
                ReleaseApproval.Status.APPROVED
                if action == "approve"
                else ReleaseApproval.Status.CHANGES_REQUESTED
            )
            active.note = note
            active.decided_at = timezone.now()
            active.save(update_fields=["status", "note", "decided_at"])
        elif action == "start":
            if not steps or active or state not in ("planned", "in_progress"):
                raise ValidationError(
                    {"detail": "Set up approval steps before starting review."}
                )
            if organization_users(user).filter(
                is_active=True, pk__in={item.approver_id for item in steps}
            ).count() != len({item.approver_id for item in steps}):
                raise ValidationError(
                    {"detail": "Assign an active organization member to every step."}
                )
            release.status = "in_progress"
        elif action == "resume":
            if state != "changes_requested" or active is None or step != active:
                raise ValidationError(
                    {
                        "detail": "Only a step requesting changes can be sent back for review."
                    }
                )
            active.status = ReleaseApproval.Status.PENDING
            active.save(update_fields=["status"])
        elif action == "finish":
            if state != "ready":
                raise ValidationError(
                    {
                        "detail": "Complete all approval steps before marking this release done."
                    }
                )
            release.status = "done"
        elif action == "reassign":
            if (
                state == "done"
                or step is None
                or step.status == ReleaseApproval.Status.APPROVED
            ):
                raise ValidationError(
                    {"detail": "Choose an approval step that still needs a decision."}
                )
            approver = (
                organization_users(user)
                .filter(pk=data.validated_data.get("approver_id"), is_active=True)
                .first()
            )
            if not approver:
                raise ValidationError(
                    {"approver_id": "Choose an active member of this organization."}
                )
            step.approver = approver
            step.save(update_fields=["approver"])

        next_state, _ = workflow_state(release, list(release.approval_steps.all()))
        if next_state != state:
            from projects.workflow_graph import enforce_transition

            project_ids = release.tasks.values_list("project_id", flat=True).distinct()
            for project_id in project_ids:
                from projects.models import Project

                enforce_transition(Project.objects.get(pk=project_id), "release", state, next_state)

        PlanningItem.objects.filter(pk=release.pk).update(
            status=release.status, updated_at=timezone.now()
        )
        AuditEvent.objects.create(
            organization_id=org_id,
            actor=user,
            action=action,
            entity_type="projects.release",
            entity_id=str(pk),
            summary=f"{release.name}{' · ' + step.name if step else ''}"[:255],
        )
        return Response(release_json(read_releases(user, org_id).get(pk=pk), user))

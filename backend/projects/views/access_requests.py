from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import EDIT_PROJECT_ROLES, get_role, visible_projects
from projects.models import Project, ProjectAccessRequest, ProjectMembership, ProjectRole
from projects.serializers.owner import person_summary


class AccessRequestInput(serializers.Serializer):
    requested_role = serializers.ChoiceField(choices=(ProjectRole.MEMBER, ProjectRole.VIEWER))
    reason = serializers.CharField(max_length=1000, allow_blank=False)


def request_summary(item, request):
    return {
        "id": item.pk,
        "project_id": item.project_id,
        "project_name": item.project.name,
        "requester": person_summary(item.requester, request),
        "requested_role": item.requested_role,
        "reason": item.reason,
        "status": item.status,
        "created_at": item.created_at,
    }


class ProjectAccessRequestView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        project = get_object_or_404(
            Project.objects.filter(organization_id=request.user.active_organization_id, organization__members=request.user), pk=pk
        )
        if get_role(request.user, project):
            raise ValidationError({"detail": "You already have access to this project."})
        data = AccessRequestInput(data=request.data)
        data.is_valid(raise_exception=True)
        item, created = ProjectAccessRequest.objects.get_or_create(
            project=project, requester=request.user, defaults=data.validated_data
        )
        if not created:
            if item.status == "pending":
                return Response(request_summary(item, request))
            item.requested_role = data.validated_data["requested_role"]
            item.reason = data.validated_data["reason"]
            item.status = "pending"
            item.reviewed_by = None
            item.created_at = timezone.now()
            item.save()
        return Response(request_summary(item, request), status=201)


class ProjectAccessRequestInboxView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = visible_projects(request.user)
        if not request.user.is_site_admin:
            projects = projects.filter(
                Q(memberships__removal_date__isnull=True) | Q(memberships__removal_date__gt=timezone.localdate()),
                memberships__user=request.user,
                memberships__role__role_name__in=EDIT_PROJECT_ROLES,
            )
        items = ProjectAccessRequest.objects.filter(
            project__in=projects, status="pending", requester__is_active=True,
            requester__organizations=request.user.active_organization_id,
        ).select_related("project", "requester").distinct()
        return Response([request_summary(item, request) for item in items])


class ProjectAccessRequestReviewView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, pk):
        item = get_object_or_404(
            ProjectAccessRequest.objects.select_for_update().select_related("project", "requester").filter(project__in=visible_projects(request.user)), pk=pk
        )
        if get_role(request.user, item.project) not in EDIT_PROJECT_ROLES:
            raise PermissionDenied("Only project owners and admins can review access requests.")
        decision = request.data.get("status")
        if decision not in ("approved", "declined"):
            raise ValidationError({"status": "Choose approved or declined."})
        if item.status != "pending":
            raise ValidationError({"detail": "This request has already been reviewed."})
        if decision == "approved":
            if not item.requester.is_active or not item.requester.organizations.filter(pk=item.project.organization_id).exists():
                raise ValidationError({"detail": "The requester is no longer an active organization member."})
            existing_role = get_role(item.requester, item.project)
            if not existing_role:
                ProjectMembership.objects.update_or_create(
                    project=item.project, user=item.requester,
                    defaults={"role": ProjectRole.objects.get(role_name=item.requested_role), "removal_date": None},
                )
        item.status = decision
        item.reviewed_by = request.user
        item.save(update_fields=("status", "reviewed_by", "updated_at"))
        return Response(request_summary(item, request))

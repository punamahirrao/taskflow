from django.conf import settings
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Organization
from accounts.organizations import require_organization
from accounts.permissions import OrganizationAdmin
from documents.models import Document
from tasks.models import Task, AgileBoard
from django.db.models import Sum


class BillingUsageView(APIView):
    permission_classes = [OrganizationAdmin]

    def get(self, request):
        organization = Organization.objects.get(pk=require_organization(request.user))
        return Response(
            {
                "organization": organization.name,
                "environment": settings.DATA_ENV,
                "billing_connected": False,
                "users": organization.members.count(),
                "projects": organization.projects.count(),
                "work_items": Task.objects.filter(
                    project__organization=organization
                ).count(),
                "boards": AgileBoard.objects.filter(
                    project__organization=organization
                ).count(),
                "storage_bytes": Document.objects.filter(
                    organization=organization
                ).aggregate(total=Sum("size"))["total"]
                or 0,
            }
        )

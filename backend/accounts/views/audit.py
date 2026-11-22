from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import AuditEvent
from accounts.organizations import require_organization
from accounts.permissions import OrganizationAdmin
from common.pagination import StandardResultsPagination


class AuditLogView(APIView):
    permission_classes = [OrganizationAdmin]

    def get(self, request):
        items = AuditEvent.objects.filter(
            organization_id=require_organization(request.user)
        ).select_related("actor")
        query = request.query_params.get("q", "").strip()[:200]
        if query:
            from django.db.models import Q

            items = items.filter(
                Q(summary__icontains=query)
                | Q(entity_type__icontains=query)
                | Q(action__icontains=query)
            )
        paginator = StandardResultsPagination()
        page = paginator.paginate_queryset(items, request, view=self)
        return paginator.get_paginated_response(
            [
                {
                    "id": item.id,
                    "action": item.action,
                    "entity_type": item.entity_type,
                    "entity_id": item.entity_id,
                    "summary": item.summary,
                    "actor": item.actor.get_full_name() or item.actor.email
                    if item.actor
                    else "System",
                    "created_at": item.created_at,
                }
                for item in page
            ]
        )

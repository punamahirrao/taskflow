from django.db import transaction
from django.conf import settings
from django.db.models import Count
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import Organization, User
from accounts.organizations import (
    MAX_ORGANIZATIONS,
    create_organization,
    organization_role,
)


class OrganizationSerializer(serializers.ModelSerializer):
    project_count = serializers.IntegerField(read_only=True, default=0)
    role = serializers.SerializerMethodField()

    def get_role(self, organization):
        request = self.context.get("request")
        if (
            request
            and request.user.is_site_admin
            and request.user.organizations.filter(pk=organization.pk).exists()
        ):
            return "admin"
        return organization_role(request.user, organization.id) if request else None

    class Meta:
        model = Organization
        fields = ("id", "name", "owner_id", "created_at", "project_count", "role")
        read_only_fields = ("id", "owner_id", "created_at", "project_count")


class OrganizationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        organizations = request.user.organizations.annotate(
            project_count=Count("projects")
        )
        return Response(
            {
                "organizations": OrganizationSerializer(
                    organizations, many=True, context={"request": request}
                ).data,
                "active_organization_id": request.user.active_organization_id,
                "limit": MAX_ORGANIZATIONS,
                "data_environment": settings.DATA_ENV,
            }
        )

    def post(self, request):
        serializer = OrganizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        organization = create_organization(
            user=request.user, name=serializer.validated_data["name"]
        )
        return Response(
            OrganizationSerializer(organization, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class OrganizationSwitchView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, pk):
        organization = get_object_or_404(request.user.organizations, pk=pk)
        User.objects.filter(pk=request.user.pk).update(active_organization=organization)
        return Response({"active_organization_id": organization.id})

from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import transaction
from django.utils import timezone

from accounts.models import User
from accounts.organizations import organization_users
from accounts.permissions import OrganizationAdminWrite
from accounts.serializers import (
    UserCreateSerializer,
    UserListSerializer,
    UserUpdateSerializer,
)
from accounts.serializers.profile import ProfileSerializer
from projects.models import ProjectMembership


class UserListView(ListCreateAPIView):
    permission_classes = [IsAuthenticated, OrganizationAdminWrite]
    pagination_class = None

    def get_queryset(self):
        return organization_users(self.request.user).order_by("-date_joined", "-id")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer

        return UserListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            UserListSerializer(user, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class UserUpdateView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated, OrganizationAdminWrite]
    http_method_names = ["patch", "delete", "options"]

    def get_queryset(self):
        return organization_users(self.request.user)

    def get_serializer_class(self):
        return UserUpdateSerializer

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        if (
            user.owned_organizations.filter(
                pk=request.user.active_organization_id
            ).exists()
            and user != request.user
        ):
            return Response(
                {"detail": "The organization owner manages their own account."},
                status=403,
            )
        if user.organizations.count() > 1:
            return Response(
                {
                    "detail": "This user belongs to multiple organizations. They must update their own account from Profile."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if user == request.user and serializer.validated_data.get("is_active") is False:
            return Response(
                {"detail": "You cannot update your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()

        return Response(
            UserListSerializer(user, context={"request": request}).data,
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        if user.owned_organizations.filter(
            pk=request.user.active_organization_id
        ).exists():
            return Response(
                {
                    "detail": "Transfer organization ownership before removing its owner."
                },
                status=400,
            )

        if user == request.user:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.project_memberships.filter(
            project__organization_id=request.user.active_organization_id,
            role__role_name="owner",
        ).exists():
            return Response(
                {"detail": "This user owns projects. Deactivate the account instead."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.project_memberships.filter(
            project__organization_id=request.user.active_organization_id
        ).delete()
        organization_id = request.user.active_organization_id
        user.organizations.remove(organization_id)
        if user.active_organization_id == organization_id:
            user.active_organization = user.organizations.first()
            user.default_project = None
            user.save(update_fields=["active_organization", "default_project"])
        if not user.organizations.exists():
            user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserTeamProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = get_object_or_404(
            organization_users(request.user), pk=pk, is_active=True
        )
        active_membership = Q(removal_date__isnull=True) | Q(
            removal_date__gt=timezone.localdate()
        )
        can_view = (
            request.user.is_site_admin
            or ProjectMembership.objects.filter(
                active_membership,
                user=request.user,
                project__organization_id=request.user.active_organization_id,
                role__role_name__in=("owner", "admin"),
                project__memberships__user=user,
            )
            .filter(
                Q(project__memberships__removal_date__isnull=True)
                | Q(project__memberships__removal_date__gt=timezone.localdate())
            )
            .exists()
        )
        if not can_view:
            return Response(
                {"detail": "Only project owners and admins can view this profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(ProfileSerializer(user, context={"request": request}).data)

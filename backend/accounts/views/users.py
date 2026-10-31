from rest_framework import status
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone

from accounts.models import User
from accounts.serializers import (
    UserCreateSerializer,
    UserListSerializer,
    UserUpdateSerializer,
)
from accounts.serializers.profile import ProfileSerializer
from projects.models import ProjectMembership


class UserListView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return User.objects.order_by("-date_joined", "-id")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer

        return UserListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            UserListSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )


class UserUpdateView(RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    queryset = User.objects.all()
    http_method_names = ["patch", "delete", "options"]

    def get_serializer_class(self):
        return UserUpdateSerializer

    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)

        if user == request.user and serializer.validated_data.get("is_active") is False:
            return Response(
                {"detail": "You cannot update your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        serializer.save()

        return Response(
            UserListSerializer(user).data,
            status=status.HTTP_200_OK,
        )

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        if user == request.user:
            return Response(
                {"detail": "You cannot delete your own account."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.project_memberships.filter(role__role_name="owner").exists():
            return Response(
                {"detail": "This user owns projects. Deactivate the account instead."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserTeamProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk, is_active=True)
        active_membership = Q(removal_date__isnull=True) | Q(
            removal_date__gt=timezone.localdate()
        )
        can_view = request.user.is_site_admin or ProjectMembership.objects.filter(
            active_membership,
            user=request.user,
            role__role_name__in=("owner", "admin"),
            project__memberships__user=user,
        ).filter(
            Q(project__memberships__removal_date__isnull=True)
            | Q(project__memberships__removal_date__gt=timezone.localdate())
        ).exists()
        if not can_view:
            return Response(
                {"detail": "Only project owners and admins can view this profile."},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(ProfileSerializer(user, context={"request": request}).data)

from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import serializers, status
from rest_framework.generics import RetrieveUpdateDestroyAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .access import (
    EDIT_PROJECT_ROLES,
    can_assign_role,
    can_change_member,
    get_role,
    visible_projects,
)
from .models import ProjectMembership, ProjectRole
from .permissions import ProjectRolePermission
from .serializers import ProjectMemberSerializer, ProjectSerializer

User = get_user_model()


class ProjectListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = visible_projects(request.user).order_by("-created_at")
        serializer = ProjectSerializer(
            projects, many=True, context={"request": request}
        )
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ProjectSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        project = serializer.save()

        return Response(
            ProjectSerializer(project, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class ProjectDetailView(RetrieveUpdateDestroyAPIView):
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, ProjectRolePermission]
    http_method_names = ["get", "patch", "delete", "options"]

    def get_queryset(self):
        return visible_projects(self.request.user)


class MemberInputSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=False)
    role = serializers.ChoiceField(
        choices=[
            ProjectRole.ADMIN,
            ProjectRole.MEMBER,
            ProjectRole.VIEWER,
        ]
    )


class ProjectMemberListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        project = get_object_or_404(visible_projects(request.user), pk=pk)
        memberships = project.memberships.select_related("user", "role").order_by("id")

        return Response(ProjectMemberSerializer(memberships, many=True).data)

    def post(self, request, pk):
        project = get_object_or_404(visible_projects(request.user), pk=pk)
        actor_role = get_role(request.user, project)

        if actor_role not in EDIT_PROJECT_ROLES:
            return Response(
                {"detail": "You do not have permission to manage members."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = MemberInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user_id = serializer.validated_data.get("user_id")
        role_name = serializer.validated_data["role"]

        if user_id is None:
            return Response(
                {"user_id": ["This field is required."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not can_assign_role(actor_role, role_name):
            return Response(
                {"detail": f"You cannot assign the {role_name} role."},
                status=status.HTTP_403_FORBIDDEN,
            )

        user = User.objects.filter(id=user_id, is_active=True).first()

        if user is None:
            return Response(
                {"user_id": ["No active user with this id."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if ProjectMembership.objects.filter(project=project, user=user).exists():
            return Response(
                {"detail": "This user is already on the project."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        membership = ProjectMembership.objects.create(
            project=project,
            user=user,
            role=ProjectRole.objects.get(role_name=role_name),
        )

        return Response(
            ProjectMemberSerializer(membership).data,
            status=status.HTTP_201_CREATED,
        )


class ProjectMemberDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_membership(self, request, pk, user_id):
        project = get_object_or_404(visible_projects(request.user), pk=pk)
        actor_role = get_role(request.user, project)
        membership = get_object_or_404(
            ProjectMembership.objects.select_related("user", "role"),
            project=project,
            user_id=user_id,
        )

        return actor_role, membership

    def patch(self, request, pk, user_id):
        actor_role, membership = self.get_membership(request, pk, user_id)

        serializer = MemberInputSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role_name = serializer.validated_data["role"]

        if not can_change_member(actor_role, membership.role.role_name, role_name):
            return Response(
                {"detail": "You cannot change this member's role."},
                status=status.HTTP_403_FORBIDDEN,
            )

        membership.role = ProjectRole.objects.get(role_name=role_name)
        membership.save(update_fields=["role"])

        return Response(ProjectMemberSerializer(membership).data)

    def delete(self, request, pk, user_id):
        actor_role, membership = self.get_membership(request, pk, user_id)

        if not can_change_member(actor_role, membership.role.role_name):
            return Response(
                {"detail": "You cannot remove this member."},
                status=status.HTTP_403_FORBIDDEN,
            )

        membership.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
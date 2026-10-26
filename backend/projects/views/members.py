from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import (
    EDIT_PROJECT_ROLES,
    can_assign_role,
    get_role,
    visible_projects,
)
from projects.models import ProjectMembership, ProjectRole
from projects.serializers.membership import (
    MemberInputSerializer,
    ProjectMemberSerializer,
)

User = get_user_model()


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

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import can_change_member, get_role, visible_projects
from projects.models import ProjectMembership, ProjectRole
from projects.serializers.membership import (
    MemberInputSerializer,
    ProjectMemberSerializer,
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

        return Response(ProjectMemberSerializer(membership, context={"request": request}).data)

    def delete(self, request, pk, user_id):
        actor_role, membership = self.get_membership(request, pk, user_id)

        if not can_change_member(actor_role, membership.role.role_name):
            return Response(
                {"detail": "You cannot remove this member."},
                status=status.HTTP_403_FORBIDDEN,
            )

        membership.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

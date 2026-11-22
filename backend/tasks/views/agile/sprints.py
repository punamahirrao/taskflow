from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import EDIT_PROJECT_ROLES, get_role, visible_projects
from tasks.models import AgileBoard
from tasks.repositories.sprints import visible_sprint, visible_sprints
from tasks.services.sprints import sync_sprint_board
from tasks.permissions import CanManageSprint
from tasks.serializers import SprintSerializer


class SprintListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = visible_projects(request.user)
        if request.query_params.get("project_id"):
            projects = projects.filter(id=request.query_params["project_id"])
        sprints = visible_sprints(request.user)
        if request.query_params.get("project_id"):
            sprints = sprints.filter(project_id=request.query_params["project_id"])
        board_id = request.query_params.get("board_id")
        if board_id:
            board = get_object_or_404(
                AgileBoard.objects.filter(project__in=projects, is_archived=False),
                id=board_id,
            )
            if (
                not request.user.is_site_admin
                and get_role(request.user, board.project) not in EDIT_PROJECT_ROLES
                and board.owner_id != request.user.id
                and not board.members.filter(id=request.user.id).exists()
                and not board.sprints.filter(tasks__assignee=request.user).exists()
            ):
                return Response(
                    {"detail": "You do not have access to this board."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            sprints = sprints.filter(board=board)
        return Response(SprintSerializer(sprints, many=True, context={"request": request}).data)

    @transaction.atomic
    def post(self, request):
        project_id = request.data.get("project_id")
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response(
                {"detail": "Only owners and managers can create a sprint."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = SprintSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sprint = serializer.save(project=project)
        if sprint.is_active:
            sync_sprint_board(sprint, request.user)
            sprint.refresh_from_db()
        return Response(SprintSerializer(sprint, context={"request": request}).data, status=status.HTTP_201_CREATED)


class SprintDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        permissions = super().get_permissions()
        if self.request.method in {"PATCH", "PUT"}:
            permissions.append(CanManageSprint())
        return permissions

    @transaction.atomic
    def patch(self, request, sprint_id):
        sprint = get_object_or_404(visible_sprint(request.user, sprint_id))
        self.check_object_permissions(request, sprint)
        serializer = SprintSerializer(sprint, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get("is_active"):
            if sprint.is_closed:
                return Response(
                    {"detail": "A closed sprint cannot be restarted."},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        activity_changed = (
            "is_active" in serializer.validated_data
            and serializer.validated_data["is_active"] != sprint.is_active
        )
        active_name_changed = (
            sprint.is_active
            and "name" in serializer.validated_data
            and serializer.validated_data["name"] != sprint.name
        )
        sprint = serializer.save()
        if activity_changed or active_name_changed:
            sync_sprint_board(sprint, request.user)
        sprint.refresh_from_db()
        return Response(SprintSerializer(sprint, context={"request": request}).data)

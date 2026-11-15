from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import EDIT_PROJECT_ROLES, get_role, visible_projects
from tasks.models import AgileBoard, Sprint
from tasks.serializers import SprintSerializer


def sync_sprint_board(sprint, owner):
    if sprint.is_active and not sprint.is_closed:
        if sprint.board_id and not Sprint.objects.filter(board_id=sprint.board_id).exclude(id=sprint.id).exists():
            if sprint.board.name != sprint.name:
                sprint.board.name = sprint.name
                sprint.board.save(update_fields=["name", "updated_at"])
            return sprint.board
        board = AgileBoard.objects.create(
            project=sprint.project,
            name=sprint.name,
            description=f"Active sprint board for {sprint.name}.",
            board_type=AgileBoard.SCRUM,
            owner=owner,
        )
        board.members.add(owner)
        sprint.board = board
        sprint.save(update_fields=["board"])
        return board
    if sprint.board_id:
        board = sprint.board
        sprint.board = None
        sprint.save(update_fields=["board"])
        if not Sprint.objects.filter(board_id=board.id).exists():
            board.delete()
    return None


class SprintListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        projects = visible_projects(request.user)
        if request.query_params.get("project_id"):
            projects = projects.filter(id=request.query_params["project_id"])
        sprints = Sprint.objects.filter(project__in=projects)
        board_id = request.query_params.get("board_id")
        if board_id:
            board = get_object_or_404(AgileBoard.objects.filter(project__in=projects, is_archived=False), id=board_id)
            if not request.user.is_site_admin and get_role(request.user, board.project) not in EDIT_PROJECT_ROLES and board.owner_id != request.user.id and not board.members.filter(id=request.user.id).exists() and not board.sprints.filter(tasks__assignee=request.user).exists():
                return Response({"detail": "You do not have access to this board."}, status=status.HTTP_404_NOT_FOUND)
            sprints = sprints.filter(board=board)
        return Response(SprintSerializer(sprints, many=True).data)

    @transaction.atomic
    def post(self, request):
        project_id = request.data.get("project_id")
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can create a sprint."}, status=status.HTTP_403_FORBIDDEN)
        serializer = SprintSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        sprint = serializer.save(project=project)
        if sprint.is_active:
            sync_sprint_board(sprint, request.user)
            sprint.refresh_from_db()
        return Response(SprintSerializer(sprint).data, status=status.HTTP_201_CREATED)


class SprintDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, sprint_id):
        sprint = get_object_or_404(Sprint.objects.filter(project__in=visible_projects(request.user)), id=sprint_id)
        if sprint.board_id and sprint.board.owner_id != request.user.id and not request.user.is_site_admin and get_role(request.user, sprint.project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only the board owner or project administrators can update this sprint."}, status=status.HTTP_403_FORBIDDEN)
        if get_role(request.user, sprint.project) not in EDIT_PROJECT_ROLES and (not sprint.board_id or sprint.board.owner_id != request.user.id):
            return Response({"detail": "Only owners and managers can update a sprint."}, status=status.HTTP_403_FORBIDDEN)
        serializer = SprintSerializer(sprint, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        if serializer.validated_data.get("is_active"):
            if sprint.is_closed:
                return Response({"detail": "A closed sprint cannot be restarted."}, status=status.HTTP_400_BAD_REQUEST)
        sprint = serializer.save()
        sync_sprint_board(sprint, request.user)
        sprint.refresh_from_db()
        return Response(SprintSerializer(sprint).data)

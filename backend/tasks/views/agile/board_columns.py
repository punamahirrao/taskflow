from django.shortcuts import get_object_or_404
from django.utils.text import slugify
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import EDIT_PROJECT_ROLES, get_role, visible_projects
from tasks.models import BoardColumn
from tasks.serializers import BoardColumnSerializer
from tasks.views.list_create import ensure_default_columns


class ProjectBoardColumnsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        ensure_default_columns(project)
        return Response(BoardColumnSerializer(project.board_columns.all(), many=True).data)

    def post(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can update board columns."}, status=status.HTTP_403_FORBIDDEN)
        name = str(request.data.get("name", "")).strip()
        if not name:
            return Response({"name": "Enter a column name."}, status=status.HTTP_400_BAD_REQUEST)
        key = slugify(name).replace("-", "_")[:40]
        if not key or project.board_columns.filter(key=key).exists():
            return Response({"name": "That column already exists."}, status=status.HTTP_400_BAD_REQUEST)
        column = BoardColumn.objects.create(project=project, name=name[:80], key=key, position=project.board_columns.count(), wip_limit=request.data.get("wip_limit") or None)
        return Response(BoardColumnSerializer(column).data, status=status.HTTP_201_CREATED)


class ProjectBoardColumnDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, project_id, column_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can update board columns."}, status=status.HTTP_403_FORBIDDEN)
        column = get_object_or_404(BoardColumn, project=project, id=column_id)
        serializer = BoardColumnSerializer(column, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

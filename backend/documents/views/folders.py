from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from documents.models import Folder
from documents.serializers import FolderSerializer
from documents.views.common import can_manage, folder_in_location, scoped_items
from projects.access import WRITE_TASK_ROLES, get_role, visible_projects
from django.shortcuts import get_object_or_404


class FolderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        project = _writeable_project(request.user, request.data.get("project_id"))
        if isinstance(project, Response):
            return project
        name = str(request.data.get("name", "")).strip()
        if not name:
            return Response({"name": "Enter a folder name."}, status=status.HTTP_400_BAD_REQUEST)
        parent = folder_in_location(request.user, request.data.get("parent_id"), project)
        if request.data.get("parent_id") and not parent:
            return Response({"parent_id": "Choose a folder in the selected location."}, status=status.HTTP_400_BAD_REQUEST)
        folder = Folder.objects.create(name=name[:120], project=project, owner=request.user, parent=parent)
        return Response(FolderSerializer(folder).data, status=status.HTTP_201_CREATED)


class FolderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, folder_id):
        folder = get_object_or_404(scoped_items(request.user, Folder), id=folder_id)
        if not can_manage(request.user, folder):
            return Response({"detail": "Only the folder creator or project owner can rename it."}, status=status.HTTP_403_FORBIDDEN)
        name = str(request.data.get("name", "")).strip()
        if not name:
            return Response({"name": "Enter a folder name."}, status=status.HTTP_400_BAD_REQUEST)
        folder.name = name[:120]
        folder.save(update_fields=["name", "updated_at"])
        return Response(FolderSerializer(folder).data)

    def delete(self, request, folder_id):
        folder = get_object_or_404(scoped_items(request.user, Folder), id=folder_id)
        if not can_manage(request.user, folder):
            return Response({"detail": "Only the folder creator or project owner can remove it."}, status=status.HTTP_403_FORBIDDEN)
        if folder.children.exists() or folder.documents.exists() or folder.resource_links.exists():
            return Response({"detail": "Move or remove the folder contents before deleting this folder."}, status=status.HTTP_409_CONFLICT)
        folder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def _writeable_project(user, project_id):
    if project_id in (None, "", "personal"):
        return None
    project = get_object_or_404(visible_projects(user), id=project_id)
    if get_role(user, project) not in WRITE_TASK_ROLES:
        return Response({"detail": "You cannot add folders to this project."}, status=status.HTTP_403_FORBIDDEN)
    return project

from urllib.parse import urlparse

from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from documents.models import ResourceLink
from documents.serializers import ResourceLinkSerializer
from documents.views.common import can_manage, folder_in_location, scoped_items
from projects.access import WRITE_TASK_ROLES, get_role, visible_projects


class ResourceLinkCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        project = None
        project_id = request.data.get("project_id")
        if project_id not in (None, "", "personal"):
            project = get_object_or_404(visible_projects(request.user), id=project_id)
            if get_role(request.user, project) not in WRITE_TASK_ROLES:
                return Response({"detail": "You cannot add resource links to this project."}, status=status.HTTP_403_FORBIDDEN)
        name = str(request.data.get("name", "")).strip()
        url = str(request.data.get("url", "")).strip()
        parsed = urlparse(url)
        if not name:
            return Response({"name": "Enter a name for this resource."}, status=status.HTTP_400_BAD_REQUEST)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc:
            return Response({"url": "Enter a valid http or https URL."}, status=status.HTTP_400_BAD_REQUEST)
        folder = folder_in_location(request.user, request.data.get("folder_id"), project)
        if request.data.get("folder_id") and not folder:
            return Response({"folder_id": "Choose a folder in the selected location."}, status=status.HTTP_400_BAD_REQUEST)
        resource = ResourceLink.objects.create(name=name[:160], url=url, project=project, folder=folder, owner=request.user)
        return Response(ResourceLinkSerializer(resource).data, status=status.HTTP_201_CREATED)


class ResourceLinkDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, resource_id):
        resource = get_object_or_404(scoped_items(request.user, ResourceLink), id=resource_id)
        if not can_manage(request.user, resource):
            return Response({"detail": "Only the link owner or project owner can remove it."}, status=status.HTTP_403_FORBIDDEN)
        resource.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

from pathlib import Path
from urllib.parse import urlparse

from django.conf import settings
from django.db.models import Q
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from documents.models import Document, Folder, ResourceLink
from documents.serializers import DocumentSerializer, FolderSerializer, ResourceLinkSerializer
from projects.access import EDIT_PROJECT_ROLES, WRITE_TASK_ROLES, get_role, visible_projects
from projects.models import Project


def scope_queryset(user, model, project_id=None):
    if project_id == "personal":
        return model.objects.filter(project__isnull=True, owner=user)
    if project_id:
        project = get_object_or_404(visible_projects(user), id=project_id)
        return model.objects.filter(project=project)
    return model.objects.filter(Q(project__in=visible_projects(user)) | Q(project__isnull=True, owner=user))


def can_manage(user, item):
    if item.owner_id == user.id:
        return True
    return bool(item.project_id and get_role(user, item.project) in EDIT_PROJECT_ROLES)


def get_parent_folder(user, folder_id, project):
    if folder_id in (None, ""):
        return None
    folder = get_object_or_404(Folder.objects.filter(id=folder_id), id=folder_id)
    if folder.project_id != (project.id if project else None):
        return None
    if project and project not in visible_projects(user):
        return None
    if folder.project_id is None and folder.owner_id != user.id:
        return None
    return folder


class DocumentLibraryView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request):
        project_id = request.query_params.get("project_id")
        folder_id = request.query_params.get("folder_id")
        folders = scope_queryset(request.user, Folder, project_id).filter(parent_id=folder_id or None)
        documents = scope_queryset(request.user, Document, project_id).filter(folder_id=folder_id or None)
        links = scope_queryset(request.user, ResourceLink, project_id).filter(folder_id=folder_id or None)
        return Response({"folders": FolderSerializer(folders, many=True).data, "documents": DocumentSerializer(documents, many=True).data, "links": ResourceLinkSerializer(links, many=True).data})

    def post(self, request):
        project_id = request.data.get("project_id")
        project = None
        if project_id not in (None, "", "personal"):
            project = get_object_or_404(visible_projects(request.user), id=project_id)
            if get_role(request.user, project) not in WRITE_TASK_ROLES:
                return Response({"detail": "You cannot add documents to this project."}, status=status.HTTP_403_FORBIDDEN)
        upload = request.FILES.get("file")
        if not upload:
            return Response({"file": "Choose a file to upload."}, status=status.HTTP_400_BAD_REQUEST)
        if upload.size > settings.DOCUMENTS_MAX_UPLOAD_BYTES:
            return Response({"file": f"Files must be {settings.DOCUMENTS_MAX_UPLOAD_BYTES // (1024 * 1024)} MB or smaller."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        folder = get_parent_folder(request.user, request.data.get("folder_id"), project)
        if request.data.get("folder_id") and not folder:
            return Response({"folder_id": "Choose a folder in the selected location."}, status=status.HTTP_400_BAD_REQUEST)
        name = str(request.data.get("name") or Path(upload.name).name).strip()[:255]
        document = Document.objects.create(name=name, file=upload, size=upload.size, content_type=upload.content_type or "", project=project, folder=folder, owner=request.user)
        return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)


class FolderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        project_id = request.data.get("project_id")
        project = None
        if project_id not in (None, "", "personal"):
            project = get_object_or_404(visible_projects(request.user), id=project_id)
            if get_role(request.user, project) not in WRITE_TASK_ROLES:
                return Response({"detail": "You cannot add folders to this project."}, status=status.HTTP_403_FORBIDDEN)
        name = str(request.data.get("name", "")).strip()
        if not name:
            return Response({"name": "Enter a folder name."}, status=status.HTTP_400_BAD_REQUEST)
        parent = get_parent_folder(request.user, request.data.get("parent_id"), project)
        if request.data.get("parent_id") and not parent:
            return Response({"parent_id": "Choose a folder in the selected location."}, status=status.HTTP_400_BAD_REQUEST)
        folder = Folder.objects.create(name=name[:120], project=project, owner=request.user, parent=parent)
        return Response(FolderSerializer(folder).data, status=status.HTTP_201_CREATED)


class FolderDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, folder_id):
        folder = get_object_or_404(scope_queryset(request.user, Folder), id=folder_id)
        if not can_manage(request.user, folder):
            return Response({"detail": "Only the folder creator or project owner can rename it."}, status=status.HTTP_403_FORBIDDEN)
        name = str(request.data.get("name", "")).strip()
        if not name:
            return Response({"name": "Enter a folder name."}, status=status.HTTP_400_BAD_REQUEST)
        folder.name = name[:120]
        folder.save(update_fields=["name", "updated_at"])
        return Response(FolderSerializer(folder).data)

    def delete(self, request, folder_id):
        folder = get_object_or_404(scope_queryset(request.user, Folder), id=folder_id)
        if not can_manage(request.user, folder):
            return Response({"detail": "Only the folder creator or project owner can remove it."}, status=status.HTTP_403_FORBIDDEN)
        if folder.children.exists() or folder.documents.exists() or folder.resource_links.exists():
            return Response({"detail": "Move or remove the folder contents before deleting this folder."}, status=status.HTTP_409_CONFLICT)
        folder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ResourceLinkCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        project_id = request.data.get("project_id")
        project = None
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
        folder = get_parent_folder(request.user, request.data.get("folder_id"), project)
        if request.data.get("folder_id") and not folder:
            return Response({"folder_id": "Choose a folder in the selected location."}, status=status.HTTP_400_BAD_REQUEST)
        resource = ResourceLink.objects.create(name=name[:160], url=url, project=project, folder=folder, owner=request.user)
        return Response(ResourceLinkSerializer(resource).data, status=status.HTTP_201_CREATED)


class ResourceLinkDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, resource_id):
        resource = get_object_or_404(scope_queryset(request.user, ResourceLink), id=resource_id)
        if not can_manage(request.user, resource):
            return Response({"detail": "Only the link owner or project owner can remove it."}, status=status.HTTP_403_FORBIDDEN)
        resource.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, document_id):
        document = get_object_or_404(scope_queryset(request.user, Document), id=document_id)
        if not can_manage(request.user, document):
            return Response({"detail": "Only the file owner or project owner can remove it."}, status=status.HTTP_403_FORBIDDEN)
        document.file.delete(save=False)
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, document_id):
        document = get_object_or_404(scope_queryset(request.user, Document), id=document_id)
        response = FileResponse(document.file.open("rb"), as_attachment=True, filename=Path(document.name).name)
        response["X-Content-Type-Options"] = "nosniff"
        return response

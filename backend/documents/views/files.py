from pathlib import Path

from django.conf import settings
from django.http import FileResponse
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from documents.models import Document
from documents.serializers import DocumentSerializer
from documents.views.common import can_manage, folder_in_location, scoped_items
from projects.access import WRITE_TASK_ROLES, get_role, visible_projects


class DocumentUploadView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        project = None
        project_id = request.data.get("project_id")
        if project_id not in (None, "", "personal"):
            project = get_object_or_404(visible_projects(request.user), id=project_id)
            if get_role(request.user, project) not in WRITE_TASK_ROLES:
                return Response({"detail": "You cannot add documents to this project."}, status=status.HTTP_403_FORBIDDEN)
        upload = request.FILES.get("file")
        if not upload:
            return Response({"file": "Choose a file to upload."}, status=status.HTTP_400_BAD_REQUEST)
        if upload.size > settings.DOCUMENTS_MAX_UPLOAD_BYTES:
            max_mb = settings.DOCUMENTS_MAX_UPLOAD_BYTES // (1024 * 1024)
            return Response({"file": f"Files must be {max_mb} MB or smaller."}, status=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)
        folder = folder_in_location(request.user, request.data.get("folder_id"), project)
        if request.data.get("folder_id") and not folder:
            return Response({"folder_id": "Choose a folder in the selected location."}, status=status.HTTP_400_BAD_REQUEST)
        name = str(request.data.get("name") or Path(upload.name).name).strip()[:255]
        document = Document.objects.create(name=name, file=upload, size=upload.size, content_type=upload.content_type or "", project=project, folder=folder, owner=request.user)
        return Response(DocumentSerializer(document).data, status=status.HTTP_201_CREATED)


class DocumentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, document_id):
        document = get_object_or_404(scoped_items(request.user, Document), id=document_id)
        if not can_manage(request.user, document):
            return Response({"detail": "Only the file owner or project owner can remove it."}, status=status.HTTP_403_FORBIDDEN)
        document.file.delete(save=False)
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class DocumentDownloadView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, document_id):
        document = get_object_or_404(scoped_items(request.user, Document), id=document_id)
        response = FileResponse(document.file.open("rb"), as_attachment=True, filename=Path(document.name).name)
        response["X-Content-Type-Options"] = "nosniff"
        return response

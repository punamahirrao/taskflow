from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from documents.models import Document, Folder, ResourceLink
from documents.serializers import DocumentSerializer, FolderSerializer, ResourceLinkSerializer
from documents.views.files import DocumentUploadView
from documents.views.common import scoped_items


class DocumentLibraryView(DocumentUploadView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        project_id = request.query_params.get("project_id")
        folder_id = request.query_params.get("folder_id") or None
        folders = scoped_items(request.user, Folder, project_id).filter(parent_id=folder_id)
        documents = scoped_items(request.user, Document, project_id).filter(folder_id=folder_id)
        links = scoped_items(request.user, ResourceLink, project_id).filter(folder_id=folder_id)
        return Response({
            "folders": FolderSerializer(folders, many=True).data,
            "documents": DocumentSerializer(documents, many=True).data,
            "links": ResourceLinkSerializer(links, many=True).data,
        })

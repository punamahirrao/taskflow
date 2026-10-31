from django.urls import path

from documents.views import DocumentDetailView, DocumentDownloadView, DocumentLibraryView, FolderCreateView, FolderDetailView, ResourceLinkCreateView, ResourceLinkDetailView

urlpatterns = [
    path("", DocumentLibraryView.as_view(), name="document-library"),
    path("folders/", FolderCreateView.as_view(), name="document-folder-create"),
    path("folders/<int:folder_id>/", FolderDetailView.as_view(), name="document-folder-detail"),
    path("links/", ResourceLinkCreateView.as_view(), name="resource-link-create"),
    path("links/<int:resource_id>/", ResourceLinkDetailView.as_view(), name="resource-link-detail"),
    path("files/<int:document_id>/", DocumentDetailView.as_view(), name="document-detail"),
    path("files/<int:document_id>/download/", DocumentDownloadView.as_view(), name="document-download"),
]

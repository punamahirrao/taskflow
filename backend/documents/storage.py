from django.conf import settings
from django.core.files.storage import FileSystemStorage


class DocumentsStorage(FileSystemStorage):
    @property
    def location(self):
        return str(settings.DOCUMENTS_ROOT)

    @property
    def base_location(self):
        return settings.DOCUMENTS_ROOT


def documents_storage():
    return DocumentsStorage()

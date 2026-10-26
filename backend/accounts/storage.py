from django.conf import settings
from django.core.files.storage import FileSystemStorage


class ProfilePicsStorage(FileSystemStorage):
    @property
    def base_location(self):
        return settings.PROFILE_PICS_ROOT

    @property
    def location(self):
        return str(settings.PROFILE_PICS_ROOT)

    @property
    def base_url(self):
        return None


def profile_pics_storage():
    return ProfilePicsStorage()

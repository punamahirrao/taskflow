from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager
from .storage import profile_pics_storage


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    job_title = models.CharField(max_length=100, blank=True)
    department = models.CharField(max_length=100, blank=True)
    profile_photo = models.FileField(
        storage=profile_pics_storage, blank=True, null=True
    )

    # Site-wide administrators use the shared project-role table.
    role = models.ForeignKey(
        "projects.ProjectRole",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="site_users",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    @property
    def is_site_admin(self):
        return self.role_id is not None and self.role.role_name == "siteadmin"

    # Django admin and DRF use this property for the staff check.
    @property
    def is_staff(self):
        return self.is_site_admin

    def __str__(self):
        return self.email

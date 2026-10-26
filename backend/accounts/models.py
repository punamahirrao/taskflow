from django.contrib.auth.models import AbstractUser
from django.db import models
from .managers import UserManager

# Create your models here.
class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)

    # Site-wide role (siteadmin), kept in the same roles table as project roles.
    role = models.ForeignKey(
        "projects.ProjectRole",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="site_users",
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    @property
    def is_site_admin(self):
        return self.role_id is not None and self.role.role_name == "siteadmin"

    # Derived from the role so Django admin and DRF keep working.
    @property
    def is_staff(self):
        return self.is_site_admin

    def __str__(self):
        return self.email
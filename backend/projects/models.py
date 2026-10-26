from django.db import models
from django.conf import settings

# Create your models here.

class ProjectRole(models.Model):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"
    # Site-wide role, held on User.role. Never used in a project membership.
    SITE_ADMIN = "siteadmin"

    role_name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.role_name


class Project(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ProjectMembership(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_memberships",
    )
    role = models.ForeignKey(
        ProjectRole,
        on_delete=models.PROTECT,
        related_name="memberships",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["project", "user"],
                name="unique_user_per_project",
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.role} - {self.project}"
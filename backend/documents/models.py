from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.db import models
from django.utils.text import slugify

from documents.storage import documents_storage
from projects.models import Project


def document_upload_path(instance, filename):
    suffix = Path(filename).suffix[:20]
    if instance.project_id:
        project_name = slugify(instance.project.name) or f"project-{instance.project_id}"
        location = f"{project_name}/"
    else:
        location = f"personal/{instance.owner_id or 'unassigned'}/"
    return f"{location}{uuid4().hex[:2]}/{uuid4().hex}{suffix}"


class Folder(models.Model):
    name = models.CharField(max_length=120)
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.CASCADE, related_name="document_folders")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="document_folders")
    parent = models.ForeignKey("self", null=True, blank=True, on_delete=models.CASCADE, related_name="children")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name", "id")

    def __str__(self):
        return self.name


class Document(models.Model):
    name = models.CharField(max_length=255)
    file = models.FileField(storage=documents_storage(), upload_to=document_upload_path)
    size = models.PositiveBigIntegerField(default=0)
    content_type = models.CharField(max_length=150, blank=True)
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.CASCADE, related_name="documents")
    folder = models.ForeignKey(Folder, null=True, blank=True, on_delete=models.SET_NULL, related_name="documents")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="documents")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at", "name", "id")

    def __str__(self):
        return self.name


class ResourceLink(models.Model):
    name = models.CharField(max_length=160)
    url = models.URLField(max_length=2000)
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.CASCADE, related_name="resource_links")
    folder = models.ForeignKey(Folder, null=True, blank=True, on_delete=models.SET_NULL, related_name="resource_links")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL, related_name="resource_links")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name", "id")

    def __str__(self):
        return self.name

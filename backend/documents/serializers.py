from rest_framework import serializers

from documents.models import Document, Folder, ResourceLink


class FolderSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True, allow_null=True)
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Folder
        fields = ("id", "name", "project", "project_name", "owner", "owner_name", "parent", "created_at", "updated_at")
        read_only_fields = ("id", "project", "owner", "created_at", "updated_at")

    def get_owner_name(self, folder):
        return folder.owner.get_full_name() if folder.owner else "Former user"


class DocumentSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True, allow_null=True)
    folder_name = serializers.CharField(source="folder.name", read_only=True, allow_null=True)
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = ("id", "name", "size", "content_type", "project", "project_name", "folder", "folder_name", "owner", "owner_name", "created_at", "updated_at")
        read_only_fields = fields

    def get_owner_name(self, document):
        return document.owner.get_full_name() if document.owner else "Former user"


class ResourceLinkSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True, allow_null=True)
    folder_name = serializers.CharField(source="folder.name", read_only=True, allow_null=True)
    owner_name = serializers.SerializerMethodField()

    class Meta:
        model = ResourceLink
        fields = ("id", "name", "url", "project", "project_name", "folder", "folder_name", "owner", "owner_name", "created_at", "updated_at")
        read_only_fields = fields

    def get_owner_name(self, resource):
        return resource.owner.get_full_name() if resource.owner else "Former user"

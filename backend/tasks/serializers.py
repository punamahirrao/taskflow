from rest_framework import serializers
from projects.models import Project
from tasks.models import Task

class TaskSerializer(serializers.ModelSerializer):
    project_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "project",
            "project_id",
            "title",
            "description",
            "status",
            "created_by",
            "created_at",
            "updated_at",
        )
        read_only_fields = ("id", "project", "created_by", "created_at", "updated_at")

    def create(self, validated_data):
        project_id = validated_data.pop("project_id")
        project = Project.objects.get(id=project_id, owner=self.context["request"].user)
        return Task.objects.create(project=project, created_by=self.context["request"].user, **validated_data)
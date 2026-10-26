from django.db import transaction
from rest_framework import serializers

from projects.models import Project, ProjectMembership, ProjectRole
from projects.serializers.membership import ProjectMemberSerializer


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "owner",
            "my_role",
            "members",
            "created_at",
            "updated_at",
        )

    def _memberships(self, project):
        cache = self.__dict__.setdefault("_membership_cache", {})

        if project.pk not in cache:
            cache[project.pk] = list(
                project.memberships.select_related("user", "role").order_by("id")
            )

        return cache[project.pk]

    def get_owner(self, project):
        for membership in self._memberships(project):
            if membership.role.role_name == ProjectRole.OWNER:
                return membership.user_id

        return None

    def get_my_role(self, project):
        request = self.context.get("request")

        if request is None:
            return None

        if request.user.is_site_admin:
            return ProjectRole.OWNER

        for membership in self._memberships(project):
            if membership.user_id == request.user.id:
                return membership.role.role_name

        return None

    def get_members(self, project):
        return ProjectMemberSerializer(self._memberships(project), many=True).data

    @transaction.atomic
    def create(self, validated_data):
        project = Project.objects.create(**validated_data)
        ProjectMembership.objects.create(
            project=project,
            user=self.context["request"].user,
            role=ProjectRole.objects.get(role_name=ProjectRole.OWNER),
        )

        return project

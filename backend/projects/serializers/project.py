from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from projects.models import Project, ProjectRole
from projects.serializers.membership import ProjectMemberSerializer
from projects.repositories import active_project_memberships
from projects.services import create_project
from common.validators import validate_project_dates


class ProjectSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    my_role = serializers.SerializerMethodField()
    members = serializers.SerializerMethodField()
    is_default = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    can_create_board = serializers.SerializerMethodField()

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "status",
            "expected_start_date",
            "end_date",
            "progress",
            "can_create_board",
            "owner",
            "my_role",
            "members",
            "is_default",
            "created_at",
            "updated_at",
        )

    def _memberships(self, project):
        cache = self.__dict__.setdefault("_membership_cache", {})

        if project.pk not in cache:
            cache[project.pk] = list(active_project_memberships(project).order_by("id"))

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

    def get_progress(self, project):
        statuses = list(project.tasks.values_list("status", flat=True))
        if not statuses:
            return 0
        return round(100 * statuses.count("done") / len(statuses))

    def get_can_create_board(self, project):
        request = self.context.get("request")
        if request is None:
            return False
        role = self.get_my_role(project)
        return role in (ProjectRole.OWNER, ProjectRole.ADMIN) or request.user.has_perm("tasks.create_agileboard")

    def get_is_default(self, project):
        request = self.context.get("request")
        return request is not None and request.user.default_project_id == project.pk

    def validate(self, attrs):
        start = attrs.get("expected_start_date", getattr(self.instance, "expected_start_date", None))
        end = attrs.get("end_date", getattr(self.instance, "end_date", None))
        try:
            validate_project_dates(start, end)
        except DjangoValidationError as error:
            raise serializers.ValidationError(error.message_dict if hasattr(error, "message_dict") else error.messages) from error
        return attrs

    def get_members(self, project):
        return ProjectMemberSerializer(
            self._memberships(project), many=True, context=self.context
        ).data

    def create(self, validated_data):
        return create_project(owner=self.context["request"].user, validated_data=validated_data)

from rest_framework import serializers

from projects.models import ProjectMembership, ProjectRole


class ProjectMemberSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="user.id", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    role = serializers.CharField(source="role.role_name", read_only=True)

    class Meta:
        model = ProjectMembership
        fields = ("id", "first_name", "last_name", "email", "role")


class MemberInputSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=False)
    role = serializers.ChoiceField(
        choices=[
            ProjectRole.ADMIN,
            ProjectRole.MEMBER,
            ProjectRole.VIEWER,
        ]
    )

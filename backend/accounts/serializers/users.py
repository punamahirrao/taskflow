from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from accounts.models import User


class UserListSerializer(serializers.ModelSerializer):
    is_staff = serializers.BooleanField(read_only=True)
    role = serializers.CharField(source="role.role_name", read_only=True, default=None)
    organization_role = serializers.SerializerMethodField()

    def get_organization_role(self, user):
        from accounts.organizations import organization_role

        request = self.context.get("request")
        return (
            organization_role(user, request.user.active_organization_id)
            if request
            else None
        )

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "account_type",
            "job_title",
            "is_staff",
            "role",
            "organization_role",
            "is_active",
            "date_joined",
        )
        read_only_fields = fields


class UserCreateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all(), lookup="iexact")]
    )
    password = serializers.CharField(
        write_only=True,
        trim_whitespace=False,
    )

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "account_type",
            "job_title",
            "password",
        )

    def validate(self, data):
        candidate = User(
            email=data["email"],
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            job_title=data.get("job_title", ""),
        )

        try:
            validate_password(data["password"], user=candidate)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": error.messages})

        return data

    @transaction.atomic
    def create(self, validated_data):
        actor = self.context["request"].user
        if (
            not actor.active_organization_id
            or not actor.organizations.filter(pk=actor.active_organization_id).exists()
        ):
            raise serializers.ValidationError(
                {"detail": "Select an organization first."}
            )
        user = User.objects.create_user(
            **validated_data,
            is_superuser=False,
            is_active=True,
            active_organization_id=actor.active_organization_id,
        )
        user.organizations.add(actor.active_organization_id)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all(), lookup="iexact")]
    )

    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "job_title",
            "is_active",
        )

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from accounts.models import User


class UserListSerializer(serializers.ModelSerializer):
    is_staff = serializers.BooleanField(read_only=True)
    role = serializers.CharField(source="role.role_name", read_only=True, default=None)

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "is_staff",
            "role",
            "is_active",
            "date_joined",
        )
        read_only_fields = fields


class UserCreateSerializer(serializers.ModelSerializer):
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
            "password",
        )

    def validate(self, data):
        candidate = User(
            email=data["email"],
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
        )

        try:
            validate_password(data["password"], user=candidate)
        except DjangoValidationError as error:
            raise serializers.ValidationError(
                {"password": error.messages}
            )

        return data

    def create(self, validated_data):
        return User.objects.create_user(
            **validated_data,
            is_superuser=False,
            is_active=True,
        )


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "first_name",
            "last_name",
            "email",
            "is_active",
        )

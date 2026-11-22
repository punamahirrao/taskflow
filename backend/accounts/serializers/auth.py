from django.contrib.auth import authenticate
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from accounts.models import User
from accounts.organizations import create_organization


class RegisterSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        validators=[UniqueValidator(queryset=User.objects.all(), lookup="iexact")]
    )
    organization_name = serializers.CharField(
        max_length=100, write_only=True, allow_blank=False
    )
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "email",
            "job_title",
            "organization_name",
            "password",
            "confirm_password",
        )

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        try:
            validate_password(data["password"], User(email=data["email"]))
        except DjangoValidationError as error:
            raise serializers.ValidationError({"password": error.messages}) from error

        return data

    @transaction.atomic
    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            email=validated_data["email"],
            job_title=validated_data["job_title"],
            password=validated_data["password"],
        )
        create_organization(user=user, name=validated_data["organization_name"])

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    account_type = serializers.ChoiceField(
        choices=User.ACCOUNT_TYPES, default="private"
    )

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(
            username=email,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError("Invalid email or password.")

        data["user"] = user

        return data

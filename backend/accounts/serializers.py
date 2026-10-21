from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "email",
            "password",
            "confirm_password",
        )

    def validate(self, data):
        if data["password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )

        return data

    def create(self, validated_data):
        validated_data.pop("confirm_password")

        user = User.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password"],
        )

        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(
            username = email,
            password = password,
        )

        if user is None:
            raise serializers.ValidationError("Invalid email or password.")

        data["user"] = user

        return data
    

class UserListSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "is_staff",
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
            is_staff=False,
            is_superuser=False,
            is_active=True,
        )
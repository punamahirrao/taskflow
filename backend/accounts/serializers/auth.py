from django.contrib.auth import authenticate
from rest_framework import serializers

from accounts.models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = (
            "email",
            "job_title",
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
            job_title=validated_data["job_title"],
            password=validated_data["password"],
        )

        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    account_type = serializers.ChoiceField(choices=User.ACCOUNT_TYPES, default="private")

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(
            username=email,
            password=password,
        )

        if user is None:
            raise serializers.ValidationError("Invalid email or password.")

        if user.account_type != data.get("account_type", "private"):
            raise serializers.ValidationError("This account does not belong to the selected login type.")

        data["user"] = user

        return data

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.conf import settings
from django.urls import reverse
from rest_framework import serializers

from accounts.models import User

IMAGE_SIGNATURES = {
    "jpg": (b"\xff\xd8\xff",),
    "jpeg": (b"\xff\xd8\xff",),
    "png": (b"\x89PNG\r\n\x1a\n",),
    "gif": (b"GIF87a", b"GIF89a"),
    "webp": (b"RIFF",),
}


class ProfileSerializer(serializers.ModelSerializer):
    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "job_title",
            "department",
            "photo_url",
        )
        read_only_fields = ("id", "email", "photo_url")

    def get_photo_url(self, user):
        if not user.profile_photo:
            return None
        path = reverse("profile_photo", args=[user.profile_photo.name])
        request = self.context.get("request")
        return request.build_absolute_uri(path) if request else path


class ProfilePhotoSerializer(serializers.Serializer):
    photo = serializers.FileField()

    def validate_photo(self, upload):
        extension = upload.name.rsplit(".", 1)[-1].lower() if "." in upload.name else ""
        if extension not in IMAGE_SIGNATURES:
            raise serializers.ValidationError("Upload a JPG, PNG, GIF, or WebP image.")
        if upload.size > settings.PROFILE_PHOTO_MAX_BYTES:
            raise serializers.ValidationError("Image must be 5 MB or smaller.")

        header = upload.read(12)
        upload.seek(0)
        if not header.startswith(IMAGE_SIGNATURES[extension]) or (
            extension == "webp" and header[8:12] != b"WEBP"
        ):
            raise serializers.ValidationError("File is not a valid image.")
        return upload


class ChangePasswordSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, trim_whitespace=False)
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)
    confirm_password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_current_password(self, value):
        if not self.context["request"].user.check_password(value):
            raise serializers.ValidationError("Current password is incorrect.")
        return value

    def validate(self, data):
        if data["new_password"] != data["confirm_password"]:
            raise serializers.ValidationError(
                {"confirm_password": "Passwords do not match."}
            )
        try:
            validate_password(data["new_password"], user=self.context["request"].user)
        except DjangoValidationError as error:
            raise serializers.ValidationError({"new_password": error.messages})
        return data

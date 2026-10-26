import uuid
from pathlib import PurePath

from django.conf import settings
from django.http import FileResponse, Http404
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers.profile import (
    ChangePasswordSerializer,
    ProfilePhotoSerializer,
    ProfileSerializer,
)


def _delete_photo(user):
    if user.profile_photo:
        user.profile_photo.delete(save=False)
        user.profile_photo = None


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(ProfileSerializer(request.user, context={"request": request}).data)

    def patch(self, request):
        serializer = ProfileSerializer(
            request.user, data=request.data, partial=True, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class ProfilePhotoView(APIView):
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = ProfilePhotoSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        upload = serializer.validated_data["photo"]
        extension = upload.name.rsplit(".", 1)[-1].lower()
        upload.name = f"{request.user.pk}-{uuid.uuid4().hex}.{extension}"

        _delete_photo(request.user)
        request.user.profile_photo = upload
        request.user.save(update_fields=["profile_photo"])
        return Response(ProfileSerializer(request.user, context={"request": request}).data)

    def delete(self, request):
        _delete_photo(request.user)
        request.user.save(update_fields=["profile_photo"])
        return Response(ProfileSerializer(request.user, context={"request": request}).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"message": "Password updated."}, status=status.HTTP_200_OK)


class ProfilePhotoFileView(APIView):
    # Served to <img> tags, which cannot send the Authorization header.
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, filename):
        if PurePath(filename).name != filename:
            raise Http404
        path = settings.PROFILE_PICS_ROOT / filename
        if not path.is_file():
            raise Http404
        return FileResponse(open(path, "rb"))

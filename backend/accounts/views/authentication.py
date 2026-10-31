import jwt
from jwt import PyJWKClient, PyJWTError
from jwt.exceptions import PyJWKClientError
from django.conf import settings
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.models import User
from accounts.serializers import LoginSerializer, RegisterSerializer

class RegisterView(APIView):

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response(
                {
                    "message": "User registered successfully.",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                    },
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data) 
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "User logged in successfully.",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                    },
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class GoogleLoginView(APIView):
    def post(self, request):
        credential = request.data.get("credential")
        if not credential:
            return Response({"credential": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        if not settings.GOOGLE_CLIENT_ID:
            return Response({"detail": "Google login is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            info = id_token.verify_oauth2_token(
                credential, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
        except ValueError:
            return Response({"detail": "Invalid Google credential."}, status=status.HTTP_400_BAD_REQUEST)

        email = info.get("email")
        if not email or not info.get("email_verified"):
            return Response({"detail": "Google email is not verified."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User(
                email=email,
                first_name=info.get("given_name", ""),
                last_name=info.get("family_name", ""),
            )
            user.set_unusable_password()
            user.save()

        if not user.is_active:
            return Response({"detail": "This account is disabled."}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "User logged in successfully.",
                "user": {"id": user.id, "email": user.email},
                "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)},
            },
            status=status.HTTP_200_OK,
        )


class MicrosoftLoginView(APIView):
    def post(self, request):
        credential = request.data.get("credential")
        if not credential:
            return Response({"credential": "This field is required."}, status=status.HTTP_400_BAD_REQUEST)

        client_id = settings.MICROSOFT_CLIENT_ID
        if not client_id:
            return Response({"detail": "Microsoft login is not configured."}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        try:
            signing_key = PyJWKClient(
                "https://login.microsoftonline.com/common/discovery/v2.0/keys"
            ).get_signing_key_from_jwt(credential).key
            info = jwt.decode(
                credential,
                signing_key,
                algorithms=["RS256"],
                audience=client_id,
                options={"verify_iss": False},
            )
        except (PyJWTError, PyJWKClientError):
            return Response({"detail": "Invalid Microsoft credential."}, status=status.HTTP_400_BAD_REQUEST)

        tenant_id = info.get("tid")
        expected_issuer = f"https://login.microsoftonline.com/{tenant_id}/v2.0"
        if not tenant_id or info.get("iss") != expected_issuer:
            return Response({"detail": "Invalid Microsoft credential issuer."}, status=status.HTTP_400_BAD_REQUEST)

        email = info.get("email") or info.get("preferred_username")
        if not email:
            return Response({"detail": "Microsoft account does not include an email address."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email__iexact=email).first()
        if user is None:
            user = User(
                email=email,
                first_name=info.get("given_name", ""),
                last_name=info.get("family_name", ""),
            )
            user.set_unusable_password()
            user.save()

        if not user.is_active:
            return Response({"detail": "This account is disabled."}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "User logged in successfully.",
                "user": {"id": user.id, "email": user.email},
                "tokens": {"refresh": str(refresh), "access": str(refresh.access_token)},
            },
            status=status.HTTP_200_OK,
        )

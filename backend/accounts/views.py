from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.generics import ListCreateAPIView
# from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserListSerializer, UserCreateSerializer


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

# Login view
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

# Dashboard view
class DashboardView(APIView):
    def get(self, request):
        return Response(
            {
                "message": "Dashboard page is coming soon."
            },
            status=status.HTTP_200_OK,
        )

# User list view for authenticated users
class UserListView(ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        return User.objects.order_by("-date_joined", "-id")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return UserCreateSerializer

        return UserListSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        return Response(
            UserListSerializer(user).data,
            status=status.HTTP_201_CREATED,
        )
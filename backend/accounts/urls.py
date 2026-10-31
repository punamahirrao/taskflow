from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views.profile import (
    ChangePasswordView,
    ProfilePhotoFileView,
    ProfilePhotoView,
    ProfileView,
)
from accounts.views import (
    DashboardView,
    LoginView,
    RegisterView,
    GoogleLoginView,
    UserListView,
    UserUpdateView,
)

urlpatterns = [
    path("me/", ProfileView.as_view(), name="profile"),
    path("me/photo/", ProfilePhotoView.as_view(), name="profile_photo_upload"),
    path("me/password/", ChangePasswordView.as_view(), name="change_password"),
    path("profile-photos/<str:filename>", ProfilePhotoFileView.as_view(), name="profile_photo"),
    path("login/", LoginView.as_view(), name="login"),
    path("google/", GoogleLoginView.as_view(), name="google_login"),
    path("register/", RegisterView.as_view(), name="register"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("users/", UserListView.as_view(), name="user_list"),
    path("users/<int:pk>/", UserUpdateView.as_view(), name="user_update"),
]

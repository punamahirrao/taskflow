from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views.organizations import OrganizationListView, OrganizationSwitchView
from accounts.views.navigation import NavigationPreferencesView
from accounts.views.typography import TypographyPreferencesView
from accounts.views.audit import AuditLogView
from accounts.views.billing import BillingUsageView

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
    MicrosoftLoginView,
    UserListView,
    UserUpdateView,
    UserTeamProfileView,
)

urlpatterns = [
    path("billing/usage/", BillingUsageView.as_view(), name="billing_usage"),
    path("audit/", AuditLogView.as_view(), name="audit_log"),
    path(
        "me/typography/",
        TypographyPreferencesView.as_view(),
        name="typography_preferences",
    ),
    path(
        "me/navigation/",
        NavigationPreferencesView.as_view(),
        name="navigation_preferences",
    ),
    path("organizations/", OrganizationListView.as_view(), name="organization_list"),
    path(
        "organizations/<int:pk>/switch/",
        OrganizationSwitchView.as_view(),
        name="organization_switch",
    ),
    path("me/", ProfileView.as_view(), name="profile"),
    path("me/photo/", ProfilePhotoView.as_view(), name="profile_photo_upload"),
    path("me/password/", ChangePasswordView.as_view(), name="change_password"),
    path(
        "profile-photos/<str:filename>",
        ProfilePhotoFileView.as_view(),
        name="profile_photo",
    ),
    path("login/", LoginView.as_view(), name="login"),
    path("google/", GoogleLoginView.as_view(), name="google_login"),
    path("microsoft/", MicrosoftLoginView.as_view(), name="microsoft_login"),
    path("register/", RegisterView.as_view(), name="register"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("dashboard/", DashboardView.as_view(), name="dashboard"),
    path("users/", UserListView.as_view(), name="user_list"),
    path(
        "users/<int:pk>/team-profile/",
        UserTeamProfileView.as_view(),
        name="team_member_profile",
    ),
    path("users/<int:pk>/", UserUpdateView.as_view(), name="user_update"),
]

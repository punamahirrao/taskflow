from rest_framework.permissions import BasePermission, SAFE_METHODS

from accounts.organizations import can_manage_organization


class OrganizationAdminWrite(BasePermission):
    message = "Only organization owners and administrators can manage users."

    def has_permission(self, request, view):
        return bool(
            request.user.is_authenticated
            and (
                request.method in SAFE_METHODS or can_manage_organization(request.user)
            )
        )


class OrganizationAdmin(BasePermission):
    message = "Only organization owners and administrators can access this page."

    def has_permission(self, request, view):
        return bool(
            request.user.is_authenticated and can_manage_organization(request.user)
        )

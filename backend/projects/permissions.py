from rest_framework.permissions import BasePermission, SAFE_METHODS

from .access import EDIT_PROJECT_ROLES, OWNER, get_role


class ProjectRolePermission(BasePermission):
    def has_object_permission(self, request, view, project):
        role = get_role(request.user, project)

        if request.method in SAFE_METHODS:
            return role is not None

        if request.method == "DELETE":
            return role == OWNER

        return role in EDIT_PROJECT_ROLES
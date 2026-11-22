from rest_framework.permissions import BasePermission

from projects.access import EDIT_PROJECT_ROLES, get_role, visible_projects

NO_WRITE_PERMISSION = {"detail": "Your role on this project is read-only."}


class CanCreateBoard(BasePermission):
    message = "BOARD_CREATE permission is required to create boards."

    def has_permission(self, request, view):
        project_id = view.kwargs.get("project_id") or request.data.get("project_id")
        if not project_id:
            return (
                True  # Let the API view return its normal project-not-found response.
            )
        project = visible_projects(request.user).filter(id=project_id).first()
        if project is None:
            return True
        return bool(
            request.user.is_site_admin
            or get_role(request.user, project) in EDIT_PROJECT_ROLES
            or request.user.has_perm("tasks.create_agileboard")
        )


class CanEditBoard(BasePermission):
    message = "Only the board owner or a project administrator can edit this board."

    def has_object_permission(self, request, view, board):
        return bool(
            request.user.is_site_admin
            or board.owner_id == request.user.id
            or get_role(request.user, board.project) in EDIT_PROJECT_ROLES
            or request.user.has_perm("tasks.create_agileboard")
        )


class CanManageSprint(BasePermission):
    message = "Only the board owner or project administrators can manage this sprint."

    def has_object_permission(self, request, view, sprint):
        return bool(
            request.user.is_site_admin
            or get_role(request.user, sprint.project) in EDIT_PROJECT_ROLES
            or (sprint.board_id and sprint.board.owner_id == request.user.id)
        )

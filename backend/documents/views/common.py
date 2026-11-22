from django.db.models import Q
from django.shortcuts import get_object_or_404

from documents.models import Folder
from projects.access import EDIT_PROJECT_ROLES, get_role, visible_projects


def scoped_items(user, model, project_id=None):
    items = model.objects.filter(
        organization_id=user.active_organization_id, organization__members=user
    )
    if project_id == "personal":
        return items.filter(project__isnull=True, owner=user)
    if project_id:
        project = get_object_or_404(visible_projects(user), id=project_id)
        return items.filter(project=project)
    return items.filter(
        Q(project__in=visible_projects(user)) | Q(project__isnull=True, owner=user)
    )


def can_manage(user, item):
    if item.owner_id == user.id:
        return True
    return bool(item.project_id and get_role(user, item.project) in EDIT_PROJECT_ROLES)


def folder_in_location(user, folder_id, project):
    if folder_id in (None, ""):
        return None
    folder = get_object_or_404(scoped_items(user, Folder), id=folder_id)
    if folder.project_id != (project.id if project else None):
        return None
    if folder.project_id is None and folder.owner_id != user.id:
        return None
    return folder

from django.db import transaction
from rest_framework.exceptions import ValidationError

from accounts.models import Organization, OrganizationMembership, User

MAX_ORGANIZATIONS = 2


@transaction.atomic
def create_organization(*, user, name):
    # Serialize creation for this account, including simultaneous requests.
    User.objects.select_for_update().get(pk=user.pk)
    if user.organizations.count() >= MAX_ORGANIZATIONS:
        raise ValidationError(
            {"detail": "You can belong to at most two organizations."}
        )
    name = name.strip()
    if not name or len(name) > 100:
        raise ValidationError(
            {"name": "Enter an organization name of 1 to 100 characters."}
        )
    if user.organizations.filter(name__iexact=name).exists():
        raise ValidationError(
            {"name": "You already have an organization with this name."}
        )
    organization = Organization.objects.create(name=name, owner=user)
    organization.members.add(user)
    if not user.active_organization_id:
        user.active_organization = organization
        user.save(update_fields=["active_organization"])
    return organization


def organization_users(user):
    if (
        not user.active_organization_id
        or not user.organizations.filter(pk=user.active_organization_id).exists()
    ):
        return User.objects.none()
    return User.objects.filter(organizations__id=user.active_organization_id)


def require_organization(user):
    if (
        not user.active_organization_id
        or not user.organizations.filter(pk=user.active_organization_id).exists()
    ):
        raise ValidationError({"detail": "Create or select an organization first."})
    return user.active_organization_id


def organization_role(user, organization_id=None):
    organization_id = organization_id or user.active_organization_id
    if not user.is_authenticated or not organization_id:
        return None
    if Organization.objects.filter(
        pk=organization_id, owner=user, members=user
    ).exists():
        return "owner"
    return (
        OrganizationMembership.objects.filter(
            organization_id=organization_id, user=user
        )
        .values_list("role", flat=True)
        .first()
    )


def can_manage_organization(user):
    return organization_role(user) in {"owner", "admin"} or bool(
        user.is_authenticated
        and user.is_site_admin
        and user.organizations.filter(pk=user.active_organization_id).exists()
    )

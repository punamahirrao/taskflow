from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.functions import Lower

from .managers import UserManager
from .storage import profile_pics_storage


class User(AbstractUser):
    ACCOUNT_TYPES = (("private", "Private"), ("organization", "Organization"))
    username = None
    email = models.EmailField(unique=True)
    account_type = models.CharField(
        max_length=20, choices=ACCOUNT_TYPES, default="private"
    )
    active_organization = models.ForeignKey(
        "accounts.Organization",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="active_users",
    )

    job_title = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True)
    about_me = models.TextField(blank=True)
    profile_photo = models.FileField(
        storage=profile_pics_storage, blank=True, null=True
    )

    default_project = models.ForeignKey(
        "projects.Project",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="+",
    )

    # Site-wide administrators use the shared project-role table.
    role = models.ForeignKey(
        "projects.ProjectRole",
        null=True,
        blank=True,
        on_delete=models.PROTECT,
        related_name="site_users",
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        constraints = [
            models.UniqueConstraint(Lower("email"), name="unique_user_email_casefold")
        ]

    @property
    def is_site_admin(self):
        return self.role_id is not None and self.role.role_name == "siteadmin"

    # Django admin and DRF use this property for the staff check.
    @property
    def is_staff(self):
        return self.is_site_admin

    def __str__(self):
        return self.email


class Organization(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(
        User,
        null=True,
        on_delete=models.SET_NULL,
        related_name="owned_organizations",
    )
    members = models.ManyToManyField(
        User, through="OrganizationMembership", related_name="organizations"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("created_at", "id")

    def __str__(self):
        return self.name


class NavigationPreference(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="navigation_preferences"
    )
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="navigation_preferences"
    )
    items = models.JSONField(default=dict)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user", "organization"),
                name="unique_navigation_per_user_organization",
            )
        ]


class OrganizationMembership(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="memberships"
    )
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="organization_memberships"
    )
    role = models.CharField(
        max_length=12,
        choices=(("admin", "Administrator"), ("member", "Member")),
        default="member",
    )
    default_project = models.ForeignKey(
        "projects.Project",
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="default_for_memberships",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("organization", "user"), name="unique_organization_member"
            ),
            models.CheckConstraint(
                condition=models.Q(role__in=("admin", "member")),
                name="valid_organization_role",
            ),
        ]


class AuditEvent(models.Model):
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="audit_events"
    )
    actor = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="audit_events",
    )
    action = models.CharField(max_length=32)
    entity_type = models.CharField(max_length=80)
    entity_id = models.CharField(max_length=80)
    summary = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at", "-id")
        indexes = [
            models.Index(
                fields=("organization", "-created_at"), name="audit_org_created_idx"
            )
        ]


class TypographyPreference(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="typography_preferences"
    )
    organization = models.ForeignKey(
        Organization, on_delete=models.CASCADE, related_name="typography_preferences"
    )
    font_family = models.CharField(max_length=100, blank=True, default="")
    font_size = models.PositiveSmallIntegerField(default=16)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=("user", "organization"),
                name="unique_typography_per_user_organization",
            ),
            models.CheckConstraint(
                condition=models.Q(font_size__gte=12, font_size__lte=24),
                name="valid_typography_size",
            ),
        ]

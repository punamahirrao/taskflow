from django.conf import settings
from django.db import models


class ProjectRole(models.Model):
    OWNER = "owner"
    ADMIN = "admin"
    MEMBER = "member"
    VIEWER = "viewer"
    # Site-wide role stored on User.role, never on project memberships.
    SITE_ADMIN = "siteadmin"

    role_name = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.role_name


class Project(models.Model):
    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE, related_name="projects"
    )
    STATUS_IN_PROGRESS = "in_progress"
    STATUS_UPCOMING = "upcoming"
    STATUS_ARCHIVED = "archived"
    STATUS_CHOICES = (
        (STATUS_IN_PROGRESS, "In progress"),
        (STATUS_UPCOMING, "Upcoming"),
        (STATUS_ARCHIVED, "Archived"),
    )

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default=STATUS_IN_PROGRESS
    )
    expected_start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class ProjectMembership(models.Model):
    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="project_memberships",
    )
    role = models.ForeignKey(
        ProjectRole,
        on_delete=models.PROTECT,
        related_name="memberships",
    )
    removal_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["project", "user"],
                name="unique_user_per_project",
            )
        ]

    def __str__(self):
        return f"{self.user} - {self.role} - {self.project}"


class ProjectAccessRequest(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="access_requests")
    requester = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="project_access_requests")
    requested_role = models.CharField(max_length=20, choices=(("member", "Member"), ("viewer", "Viewer")))
    reason = models.CharField(max_length=1000)
    status = models.CharField(max_length=12, choices=(("pending", "Pending"), ("approved", "Approved"), ("declined", "Declined")), default="pending")
    reviewed_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name="reviewed_project_access_requests")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("project", "requester"), name="unique_project_access_request")]
        ordering = ("-created_at", "-id")


class PlanningItem(models.Model):
    """Organization planning records with optional links to accessible project work."""

    organization = models.ForeignKey(
        "accounts.Organization", on_delete=models.CASCADE, related_name="planning_items"
    )
    kind = models.CharField(
        max_length=12,
        choices=(
            ("release", "Release"),
            ("goal", "Goal"),
            ("milestone", "Milestone"),
            ("template", "Template"),
        ),
    )
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=(
            ("planned", "Planned"),
            ("in_progress", "In progress"),
            ("done", "Done"),
        ),
        default="planned",
    )
    target_date = models.DateField(null=True, blank=True)
    tasks = models.ManyToManyField(
        "tasks.Task", blank=True, related_name="planning_items"
    )
    release_goals = models.ManyToManyField(
        "self", symmetrical=False, blank=True, related_name="goal_releases"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="planning_items",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("target_date", "name", "id")
        indexes = [
            models.Index(fields=("organization", "kind"), name="planning_org_kind_idx")
        ]

    def __str__(self):
        return self.name


class ReleaseApproval(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        APPROVED = "approved", "Approved"
        CHANGES_REQUESTED = "changes_requested", "Changes requested"

    release = models.ForeignKey(
        PlanningItem, on_delete=models.CASCADE, related_name="approval_steps"
    )
    position = models.PositiveSmallIntegerField()
    name = models.CharField(max_length=100)
    approver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        on_delete=models.SET_NULL,
        related_name="release_approvals",
    )
    status = models.CharField(
        max_length=24, choices=Status.choices, default=Status.PENDING
    )
    note = models.TextField(blank=True)
    decided_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("position", "id")
        constraints = [
            models.UniqueConstraint(
                fields=("release", "position"), name="unique_release_approval_position"
            )
        ]


class ProjectWorkflowGraph(models.Model):
    """Versioned transition diagram for project stories or release approvals."""

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="workflow_graphs")
    kind = models.CharField(max_length=12, choices=(("story", "Story"), ("release", "Release")))
    graph = models.JSONField(default=dict)
    enabled = models.BooleanField(default=True)
    revision = models.PositiveIntegerField(default=1)
    updated_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("project", "kind"), name="unique_project_workflow_graph")]

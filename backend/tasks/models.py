from django.conf import settings
from django.db import models

from projects.models import Project


def default_definition_of_done():
    return [
        {"key": "acceptance", "label": "Acceptance criteria met", "done": False},
        {"key": "tests", "label": "Tests pass", "done": False},
        {"key": "review", "label": "Peer review complete", "done": False},
        {"key": "docs", "label": "Documentation updated", "done": False},
    ]


class Task(models.Model):
    TYPE_CHOICES = tuple((value, label) for value, label in (
        ("task", "Task"), ("idea", "Idea"), ("enhancement", "Enhancement"),
        ("bug", "Bug"), ("spike", "Spike"), ("research", "Research"),
        ("epic", "Epic"), ("initiative", "Initiative"),
    ))
    PRIORITY_CHOICES = tuple((value, label) for value, label in (
        ("urgent", "Urgent"), ("high", "High"), ("medium", "Medium"), ("low", "Low"),
    ))

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=40, default="backlog")
    work_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="task")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    estimate = models.CharField(max_length=12, blank=True)
    tags = models.JSONField(default=list, blank=True)
    rank = models.PositiveIntegerField(default=0)
    due_date = models.DateField(null=True, blank=True)
    blocked = models.BooleanField(default=False)
    blocked_since = models.DateTimeField(null=True, blank=True)
    escalated = models.BooleanField(default=False)
    definition_done = models.JSONField(default=default_definition_of_done, blank=True)
    ready_for_sprint = models.BooleanField(default=False)
    assignee = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tasks",
    )
    blocked_by = models.ManyToManyField(
        "self",
        symmetrical=False,
        blank=True,
        related_name="blocks",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="children",
    )
    sprint = models.ForeignKey(
        "tasks.Sprint",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="tasks",
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="tasks",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.title


class TaskComment(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="task_comments")
    content = models.TextField(max_length=10000)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created_at", "id")

    def __str__(self):
        return f"Comment on {self.task_id} by {self.author_id or 'deleted user'}"


class TaskHistory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name="history")
    actor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="task_history")
    action = models.CharField(max_length=40, default="updated")
    changes = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at", "-id")

    def __str__(self):
        return f"{self.action} on task {self.task_id}"


class WorkflowStatus(models.Model):
    """A project workflow status, or a shared default when project is null."""

    project = models.ForeignKey(Project, on_delete=models.CASCADE, null=True, blank=True, related_name="workflow_statuses")
    key = models.SlugField(max_length=40)
    name = models.CharField(max_length=80)
    position = models.PositiveSmallIntegerField(default=0)
    is_system = models.BooleanField(default=False)

    class Meta:
        ordering = ("position", "id")
        constraints = [models.UniqueConstraint(fields=("project", "key"), name="unique_workflow_status_key_per_project")]

    def __str__(self):
        return self.name


class BoardColumn(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="board_columns")
    board = models.ForeignKey("tasks.AgileBoard", on_delete=models.CASCADE, null=True, blank=True, related_name="columns")
    name = models.CharField(max_length=80)
    key = models.SlugField(max_length=40)
    position = models.PositiveSmallIntegerField(default=0)
    group_name = models.CharField(max_length=80, blank=True)
    wip_limit = models.PositiveSmallIntegerField(null=True, blank=True)
    statuses = models.ManyToManyField(WorkflowStatus, through="BoardColumnStatus", related_name="columns")

    class Meta:
        ordering = ("position", "id")
        constraints = [
            models.UniqueConstraint(fields=("project", "key"), condition=models.Q(board__isnull=True), name="unique_project_board_column_key"),
            models.UniqueConstraint(fields=("board", "key"), condition=models.Q(board__isnull=False), name="unique_agile_board_column_key"),
        ]

    def __str__(self):
        return f"{self.project}: {self.name}"


class BoardColumnStatus(models.Model):
    column = models.ForeignKey(BoardColumn, on_delete=models.CASCADE, related_name="status_assignments")
    status = models.ForeignKey(WorkflowStatus, on_delete=models.CASCADE, related_name="column_assignments")
    position = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ("position", "id")
        constraints = [models.UniqueConstraint(fields=("column", "status"), name="unique_status_per_board_column")]


class AgileBoard(models.Model):
    SCRUM = "scrum"
    KANBAN = "kanban"
    BOARD_TYPES = ((SCRUM, "Scrum"), (KANBAN, "Kanban"))

    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="agile_boards")
    name = models.CharField(max_length=100)
    board_type = models.CharField(max_length=12, choices=BOARD_TYPES)
    description = models.TextField(blank=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="owned_agile_boards")
    members = models.ManyToManyField(settings.AUTH_USER_MODEL, blank=True, related_name="agile_boards")
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("created_at", "id")

    def __str__(self):
        return f"{self.name} ({self.get_board_type_display()})"


class Sprint(models.Model):
    board = models.ForeignKey("tasks.AgileBoard", on_delete=models.SET_NULL, null=True, blank=True, related_name="sprints")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="sprints")
    name = models.CharField(max_length=100)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=False)
    is_closed = models.BooleanField(default=False)
    goal = models.CharField(max_length=255, blank=True)
    capacity_points = models.PositiveSmallIntegerField(null=True, blank=True)
    velocity_points = models.PositiveSmallIntegerField(null=True, blank=True)
    outcome_summary = models.TextField(blank=True)
    retrospective = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-is_active", "-start_date", "-id")

    def __str__(self):
        return f"{self.project}: {self.name}"

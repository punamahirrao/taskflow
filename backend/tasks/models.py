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


class BoardColumn(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="board_columns")
    name = models.CharField(max_length=80)
    key = models.SlugField(max_length=40)
    position = models.PositiveSmallIntegerField(default=0)
    wip_limit = models.PositiveSmallIntegerField(null=True, blank=True)

    class Meta:
        ordering = ("position", "id")
        constraints = [models.UniqueConstraint(fields=("project", "key"), name="unique_board_column_key")]

    def __str__(self):
        return f"{self.project}: {self.name}"


class Sprint(models.Model):
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

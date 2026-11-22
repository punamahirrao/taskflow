from datetime import timedelta

from django.db.models import Count, Exists, F, OuterRef, Q
from django.db.models.functions import TruncDate
from django.utils import timezone

from dashboard.services import scoped_projects
from projects.access import visible_projects
from projects.models import PlanningItem
from tasks.models import Sprint, Task


def delivery_snapshot(user, project_id):
    today = timezone.localdate()
    start = today - timedelta(days=27)
    upcoming_end = today + timedelta(days=6)
    projects = scoped_projects(user, project_id)
    if project_id is None:
        projects = projects.exclude(status="archived")

    open_task = ~Q(status="done")
    overdue = Q(due_date__lt=today)
    due_soon = Q(due_date__range=(today, upcoming_end))
    outstanding_dependency = Task.objects.filter(
        blocks=OuterRef("pk"), project__in=visible_projects(user)
    ).exclude(status="done")
    blocked = Q(blocked=True) | Q(has_open_dependency=True)
    tasks = Task.objects.filter(project__in=projects).alias(
        has_open_dependency=Exists(outstanding_dependency)
    )
    work = tasks.values("project_id").annotate(
        total=Count("pk"),
        done=Count("pk", filter=Q(status="done")),
        in_review=Count("pk", filter=Q(status="review")),
        overdue=Count("pk", filter=open_task & overdue),
        blocked_count=Count("pk", filter=open_task & blocked),
        due_soon=Count("pk", filter=open_task & due_soon),
        at_risk=Count("pk", filter=open_task & (overdue | blocked)),
    )
    by_project = {}
    for item in work:
        item["blocked"] = item.pop("blocked_count")
        by_project[item.pop("project_id")] = item
    default_counts = dict.fromkeys(
        ("total", "done", "in_review", "overdue", "blocked", "due_soon", "at_risk"), 0
    )
    project_health = [
        {**project, **by_project.get(project["id"], default_counts)}
        for project in projects.order_by("name", "id").values(
            "id", "name", "status", "end_date"
        )
    ]

    def daily_counts(field):
        return {
            entry["date"]: entry["count"]
            for entry in tasks.filter(**{f"{field}__date__range": (start, today)})
            .annotate(date=TruncDate(field))
            .values("date")
            .annotate(count=Count("pk"))
        }

    created = daily_counts("created_at")
    completed = daily_counts("completed_at")
    dates = [start + timedelta(days=offset) for offset in range(28)]

    def attention_items(condition):
        matches = tasks.filter(open_task & condition).select_related(
            "project", "assignee"
        )
        return [
            {
                "id": task.id,
                "title": task.title,
                "project_id": task.project_id,
                "project_name": task.project.name,
                "due_date": task.due_date,
                "priority": task.priority,
                "assignee": (task.assignee.get_full_name() or task.assignee.email)
                if task.assignee
                else None,
            }
            for task in matches.order_by(F("due_date").asc(nulls_last=True), "id")[:8]
        ]

    sprints = (
        Sprint.objects.filter(project__in=projects, is_active=True, is_closed=False)
        .annotate(
            total=Count("tasks"), done=Count("tasks", filter=Q(tasks__status="done"))
        )
        .order_by(F("end_date").asc(nulls_last=True), "id")
    )
    plans = (
        PlanningItem.objects.filter(
            organization_id=user.active_organization_id,
            tasks__project__in=projects,
            target_date__range=(today, today + timedelta(days=29)),
            kind__in=("milestone", "release", "goal"),
        )
        .exclude(status="done")
        .distinct()
        .order_by("target_date", "id")
    )

    return {
        "as_of": today,
        "projects": project_health,
        "trend": [
            {
                "date": day,
                "created": created.get(day, 0),
                "completed": completed.get(day, 0),
            }
            for day in dates
        ],
        "attention": {
            "overdue": attention_items(overdue),
            "blocked": attention_items(blocked),
            "due_soon": attention_items(due_soon),
        },
        "sprint_count": sprints.count(),
        "sprints": list(
            sprints.values(
                "id",
                "name",
                "project_id",
                "project__name",
                "end_date",
                "goal",
                "total",
                "done",
            )[:6]
        ),
        "milestones": list(plans.values("id", "kind", "name", "target_date")[:6]),
    }

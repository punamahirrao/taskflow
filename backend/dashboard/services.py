from typing import Any

from django.db.models import Count, Q, QuerySet

from projects.access import visible_projects
from projects.models import Project
from tasks.models import Sprint, Task


def scoped_projects(user: Any, project_id: int | None = None) -> QuerySet[Project]:
    projects = visible_projects(user)
    if project_id is not None:
        projects = projects.filter(id=project_id)
    return projects


def overview_for_user(user: Any, project_id: int | None = None) -> dict[str, int]:
    projects = scoped_projects(user, project_id)
    task_summary = Task.objects.filter(project__in=projects).aggregate(
        total=Count("id"),
        completed=Count("id", filter=Q(status="done")),
    )
    total = task_summary["total"] or 0
    completed = task_summary["completed"] or 0
    return {
        "total_projects": projects.count(),
        "total_tasks": total,
        "completed_tasks": completed,
        "pending_tasks": total - completed,
        "completion_rate": round(completed / total * 100) if total else 0,
        "active_sprints": Sprint.objects.filter(
            project__in=projects, is_active=True, is_closed=False
        ).count(),
    }


def active_sprints_for_user(
    user: Any, project_id: int | None = None
) -> QuerySet[Sprint]:
    return Sprint.objects.filter(
        project__in=scoped_projects(user, project_id), is_active=True, is_closed=False
    ).select_related("project", "board")


def my_tasks_for_user(user: Any, project_id: int | None = None) -> QuerySet[Task]:
    return (
        Task.objects.filter(
            project__in=scoped_projects(user, project_id), assignee=user
        )
        .exclude(status="done")
        .select_related("project", "assignee", "sprint")
        .order_by("due_date", "rank", "id")
    )


def project_health_for_user(
    user: Any, project_id: int | None = None
) -> list[dict[str, Any]]:
    projects = (
        scoped_projects(user, project_id)
        .annotate(
            task_count=Count("tasks", distinct=True),
            completed_tasks=Count(
                "tasks", filter=Q(tasks__status="done"), distinct=True
            ),
        )
        .order_by("name", "id")
    )
    sprint_counts = dict(
        Sprint.objects.filter(project__in=projects, is_active=True, is_closed=False)
        .values_list("project_id")
        .annotate(count=Count("id"))
    )
    result = []
    for project in projects:
        total = project.task_count
        result.append(
            {
                "id": project.id,
                "name": project.name,
                "status": project.status,
                "task_count": total,
                "completed_tasks": project.completed_tasks,
                "completion_rate": round(project.completed_tasks / total * 100)
                if total
                else 0,
                "active_sprints": sprint_counts.get(project.id, 0),
            }
        )
    return result

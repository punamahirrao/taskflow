import pytest
from rest_framework.test import APIClient

from tests.factories.models import (
    ProjectFactory,
    SprintFactory,
    TaskFactory,
    UserFactory,
)


@pytest.mark.django_db
def test_dashboard_overview_only_counts_visible_projects():
    owner = UserFactory()
    project = ProjectFactory(owner=owner)
    outsider_project = ProjectFactory()
    TaskFactory(project=project, created_by=owner, status="done")
    TaskFactory(project=project, created_by=owner, status="todo")
    TaskFactory(project=outsider_project, status="done")
    SprintFactory(project=project, is_active=True)

    client = APIClient()
    client.force_authenticate(owner)
    response = client.get("/dashboard/overview/")

    assert response.status_code == 200
    assert response.json() == {
        "total_projects": 1,
        "total_tasks": 2,
        "completed_tasks": 1,
        "pending_tasks": 1,
        "completion_rate": 50,
        "active_sprints": 1,
    }


@pytest.mark.django_db
def test_dashboard_my_tasks_excludes_completed_and_other_users_work():
    owner = UserFactory()
    project = ProjectFactory(owner=owner)
    TaskFactory(project=project, created_by=owner, assignee=owner, status="todo")
    TaskFactory(project=project, created_by=owner, assignee=owner, status="done")
    TaskFactory(project=project, created_by=owner, status="todo")

    client = APIClient()
    client.force_authenticate(owner)
    response = client.get("/dashboard/my-tasks/")

    assert response.status_code == 200
    assert response.json()["count"] == 1
    assert response.json()["results"][0]["status"] == "todo"


@pytest.mark.django_db
def test_dashboard_does_not_expose_projects_to_non_members():
    project = ProjectFactory()
    outsider = UserFactory()
    TaskFactory(project=project, created_by=outsider, status="done")

    client = APIClient()
    client.force_authenticate(outsider)
    response = client.get("/dashboard/project-health/")

    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.django_db
def test_my_work_tasks_and_activity_only_include_my_visible_assignments():
    from projects.models import ProjectMembership, ProjectRole
    from tasks.models import TaskHistory

    user = UserFactory()
    colleague = UserFactory()
    first = ProjectFactory(owner=user)
    second = ProjectFactory(owner=colleague)
    inaccessible = ProjectFactory()
    ProjectMembership.objects.create(
        project=second,
        user=user,
        role=ProjectRole.objects.get_or_create(role_name="member")[0],
    )
    current = TaskFactory(project=first, assignee=user, status="todo")
    completed = TaskFactory(project=second, assignee=user, status="done")
    colleague_task = TaskFactory(project=first, assignee=colleague)
    restricted = TaskFactory(project=inaccessible, assignee=user)
    for task in (current, completed, colleague_task, restricted):
        TaskHistory.objects.create(task=task, actor=colleague)

    client = APIClient()
    client.force_authenticate(user)
    tasks = client.get("/tasks/?mine=true")
    activity = client.get("/dashboard/activity/?mine=true")

    assert tasks.status_code == activity.status_code == 200
    assert {item["id"] for item in tasks.json()} == {current.id, completed.id}
    assert {item["task_id"] for item in activity.json()} == {current.id, completed.id}
    assert colleague_task.id in {item["id"] for item in client.get("/tasks/").json()}


@pytest.mark.django_db
def test_delivery_snapshot_counts_risks_once_and_respects_project_scope():
    from datetime import timedelta

    from django.utils import timezone

    from projects.models import PlanningItem

    owner = UserFactory()
    project = ProjectFactory(owner=owner)
    archived = ProjectFactory(owner=owner, status="archived")
    hidden = ProjectFactory()
    today = timezone.localdate()
    sprint = SprintFactory(project=project, is_active=True, end_date=today)
    dependency = TaskFactory(project=project, status="todo")
    late = TaskFactory(
        project=project, status="review", due_date=today - timedelta(days=1)
    )
    late.blocked_by.add(dependency)
    due = TaskFactory(
        project=project,
        status="todo",
        due_date=today + timedelta(days=6),
        sprint=sprint,
    )
    done = TaskFactory(
        project=project,
        status="done",
        blocked=True,
        due_date=today,
        sprint=sprint,
        completed_at=timezone.now(),
    )
    TaskFactory(project=archived, status="todo", blocked=True)
    TaskFactory(project=hidden, status="todo", blocked=True)
    plan = PlanningItem.objects.create(
        organization=project.organization,
        name="Beta launch",
        kind="release",
        target_date=today,
    )
    plan.tasks.add(due, done)
    client = APIClient()
    client.force_authenticate(owner)

    response = client.get("/dashboard/delivery/")
    assert response.status_code == 200
    snapshot = response.json()
    assert len(snapshot["projects"]) == 1
    health = snapshot["projects"][0]
    assert health["id"] == project.id
    assert (health["total"], health["done"], health["in_review"]) == (4, 1, 1)
    assert (
        health["overdue"],
        health["blocked"],
        health["at_risk"],
        health["due_soon"],
    ) == (1, 1, 1, 1)
    assert [item["id"] for item in snapshot["attention"]["blocked"]] == [late.id]
    assert len(snapshot["trend"]) == 28
    assert snapshot["trend"][-1] == {
        "date": today.isoformat(),
        "created": 4,
        "completed": 1,
    }
    assert (snapshot["sprints"][0]["total"], snapshot["sprints"][0]["done"]) == (2, 1)
    assert [item["id"] for item in snapshot["milestones"]] == [plan.id]
    assert (
        client.get(f"/dashboard/delivery/?project_id={hidden.id}").json()["projects"]
        == []
    )
    assert (
        client.get(f"/dashboard/delivery/?project_id={archived.id}").json()["projects"][
            0
        ]["id"]
        == archived.id
    )
    assert client.get("/dashboard/delivery/?project_id=bad").status_code == 400

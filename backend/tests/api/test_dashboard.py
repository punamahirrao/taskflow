import pytest
from rest_framework.test import APIClient

from tests.factories.models import ProjectFactory, SprintFactory, TaskFactory, UserFactory


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

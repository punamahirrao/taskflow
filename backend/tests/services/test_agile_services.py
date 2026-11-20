import pytest

from projects.models import ProjectMembership, ProjectRole
from tasks.models import TaskHistory
from tasks.services.boards import BoardMembershipError, create_agile_board
from tasks.services.sprints import SprintStateError, close_sprint, estimate_points
from tests.factories.models import BoardFactory, ProjectFactory, SprintFactory, TaskFactory, UserFactory


@pytest.mark.parametrize(("value", "expected"), [("3", 3), ("2.9", 2), ("-4", 0), ("bad", 0), (None, 0)])
def test_estimate_points_normalizes_values(value, expected):
    assert estimate_points(value) == expected


@pytest.mark.django_db
def test_create_board_assigns_only_active_project_members():
    owner = UserFactory()
    member = UserFactory()
    project = ProjectFactory(owner=owner)
    role = ProjectRole.objects.get(role_name=ProjectRole.MEMBER)
    ProjectMembership.objects.create(project=project, user=member, role=role)

    board = create_agile_board(
        project,
        owner,
        {"name": "Release Readiness", "board_type": "scrum", "members": [member]},
    )

    assert set(board.members.values_list("id", flat=True)) == {owner.id, member.id}


@pytest.mark.django_db
def test_create_board_rejects_non_project_members():
    owner = UserFactory()
    outsider = UserFactory()
    project = ProjectFactory(owner=owner)

    with pytest.raises(BoardMembershipError):
        create_agile_board(
            project,
            owner,
            {"name": "Restricted", "board_type": "kanban", "members": [outsider]},
        )


@pytest.mark.django_db
def test_close_sprint_returns_open_work_and_records_history():
    owner = UserFactory()
    project = ProjectFactory(owner=owner)
    board = BoardFactory(project=project, owner=owner)
    sprint = SprintFactory(project=project, board=board, is_active=True)
    unfinished = TaskFactory(project=project, created_by=owner, sprint=sprint, status="in_progress", estimate="3")
    TaskFactory(project=project, created_by=owner, sprint=sprint, status="done", estimate="5")

    result = close_sprint(sprint, owner)

    unfinished.refresh_from_db()
    sprint.refresh_from_db()
    assert (unfinished.status, unfinished.sprint_id, unfinished.rank) == ("backlog", None, 0)
    assert sprint.is_closed is True
    assert sprint.is_active is False
    assert sprint.velocity_points == 5
    assert sprint.board_id is None
    assert result["moved_count"] == 1
    assert TaskHistory.objects.filter(task=unfinished, action="sprint_returned_to_backlog").exists()


@pytest.mark.django_db
def test_close_sprint_rejects_planned_sprint():
    owner = UserFactory()
    sprint = SprintFactory(is_active=False)

    with pytest.raises(SprintStateError, match="Only the active sprint"):
        close_sprint(sprint, owner)

from django.db import transaction

from common.exceptions import ValidationException
from tasks.models import AgileBoard
from tasks.repositories.boards import active_project_member_ids


class BoardMembershipError(ValidationException):
    """Raised when a board is assigned to someone outside its active project team."""


def validate_board_members(project, members):
    member_ids = {member.id for member in members}
    if not member_ids.issubset(active_project_member_ids(project)):
        raise BoardMembershipError("Board members must be active members of the project.")
    return member_ids


def assign_board_members(board, member_ids, *, include_owner=False):
    """Save board membership, optionally including its owner in the relation."""
    members = set(member_ids)
    if include_owner:
        members.add(board.owner_id)
    board.members.set(members)


@transaction.atomic
def create_agile_board(project, owner, validated_data):
    """Create a board and its initial active project membership in one transaction."""
    values = dict(validated_data)
    members = values.pop("members", [])
    member_ids = validate_board_members(project, members)
    board = AgileBoard.objects.create(project=project, owner=owner, **values)
    assign_board_members(board, member_ids, include_owner=True)
    return board

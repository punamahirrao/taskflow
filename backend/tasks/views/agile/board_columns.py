from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import EDIT_PROJECT_ROLES, get_role, visible_projects
from tasks.models import AgileBoard, BoardColumn, BoardColumnStatus, Sprint, Task, WorkflowStatus
from tasks.serializers import AgileBoardSerializer, BoardColumnSerializer, WorkflowStatusSerializer
from tasks.views.list_create import ensure_default_columns

BUILT_IN_WORKFLOW_KEYS = {"todo", "in_progress", "done"}


def available_statuses(project):
    project_statuses = WorkflowStatus.objects.filter(project=project)
    shadowed_keys = project_statuses.values_list("key", flat=True)
    return WorkflowStatus.objects.filter(Q(project=project) | (Q(project__isnull=True, is_system=True) & ~Q(key__in=shadowed_keys))).order_by("position", "id")


def unique_status_key(project, name):
    base = slugify(name).replace("-", "_")[:32] or "status"
    key = base
    suffix = 2
    while WorkflowStatus.objects.filter(Q(project__isnull=True) | Q(project=project), key=key).exists():
        key = f"{base[:35]}_{suffix}"[:40]
        suffix += 1
    return key


def assign_status(project, status_obj, column):
    BoardColumnStatus.objects.filter(column__project=project, column__board__isnull=True, status=status_obj).delete()
    if column is not None:
        position = column.status_assignments.count()
        BoardColumnStatus.objects.create(column=column, status=status_obj, position=position)


def ensure_board_columns(board):
    if board.columns.exists():
        return
    ensure_default_columns(board.project)
    defaults = board.project.board_columns.filter(board__isnull=True).prefetch_related("status_assignments__status")
    for column in defaults:
        copy = BoardColumn.objects.create(project=board.project, board=board, name=column.name, key=column.key,
            position=column.position, group_name=column.group_name, wip_limit=column.wip_limit)
        for assignment in column.status_assignments.all():
            BoardColumnStatus.objects.create(column=copy, status=assignment.status, position=assignment.position)


class ProjectWorkflowView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        ensure_default_columns(project)
        return Response({
            "statuses": WorkflowStatusSerializer(available_statuses(project), many=True).data,
            "columns": BoardColumnSerializer(project.board_columns.filter(board__isnull=True), many=True).data,
            "can_manage": get_role(request.user, project) in EDIT_PROJECT_ROLES,
        })


class BoardWorkflowView(ProjectWorkflowView):
    def get(self, request, project_id, board_id):
        project, board, error = ProjectAgileBoardsView().get_object(request, project_id, board_id)
        if error:
            return error
        ensure_default_columns(project)
        ensure_board_columns(board)
        return Response({
            "statuses": WorkflowStatusSerializer(available_statuses(project), many=True).data,
            "columns": BoardColumnSerializer(board.columns.all(), many=True).data,
            "can_manage": bool(request.user.is_site_admin or board.owner_id == request.user.id or get_role(request.user, project) in EDIT_PROJECT_ROLES),
        })


class ProjectWorkflowStatusListView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only project owners and managers can configure workflow statuses."}, status=status.HTTP_403_FORBIDDEN)
        ensure_default_columns(project)
        name = str(request.data.get("name", "")).strip()[:80]
        if not name:
            return Response({"name": "Enter a status name."}, status=status.HTTP_400_BAD_REQUEST)
        status_obj = WorkflowStatus.objects.create(
            project=project,
            key=unique_status_key(project, name),
            name=name,
            position=available_statuses(project).count(),
            is_system=False,
        )
        return Response(WorkflowStatusSerializer(status_obj).data, status=status.HTTP_201_CREATED)


class ProjectWorkflowStatusDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, project_id, status_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only project owners and managers can configure workflow statuses."}, status=status.HTTP_403_FORBIDDEN)
        status_obj = get_object_or_404(available_statuses(project), id=status_id)
        if status_obj.key in BUILT_IN_WORKFLOW_KEYS and "name" in request.data:
            return Response({"detail": "To Do, In Progress, and Done are built-in statuses and cannot be renamed."}, status=status.HTTP_400_BAD_REQUEST)
        if status_obj.project_id is None and status_obj.key not in BUILT_IN_WORKFLOW_KEYS:
            status_obj = WorkflowStatus.objects.create(
                project=project,
                key=status_obj.key,
                name=status_obj.name,
                position=available_statuses(project).count(),
                is_system=False,
            )
            old_assignments = list(BoardColumnStatus.objects.filter(column__project=project, column__board__isnull=True, status__key=status_obj.key).exclude(status=status_obj))
            for assignment in old_assignments:
                BoardColumnStatus.objects.update_or_create(
                    column=assignment.column,
                    status=status_obj,
                    defaults={"position": assignment.position},
                )
                assignment.delete()
            board_assignments = list(BoardColumnStatus.objects.filter(column__project=project, column__board__isnull=False, status__key=status_obj.key).exclude(status=status_obj))
            for assignment in board_assignments:
                BoardColumnStatus.objects.update_or_create(column=assignment.column, status=status_obj, defaults={"position": assignment.position})
                assignment.delete()
        if "name" in request.data:
            name = str(request.data["name"]).strip()[:80]
            if not name:
                return Response({"name": "Enter a status name."}, status=status.HTTP_400_BAD_REQUEST)
            status_obj.name = name
        status_obj.save()
        if "column_id" in request.data:
            column_id = request.data["column_id"]
            if not column_id:
                return Response({"column_id": "A workflow status must belong to a board column."}, status=status.HTTP_400_BAD_REQUEST)
            column = get_object_or_404(project.board_columns, board__isnull=True, id=column_id)
            assign_status(project, status_obj, column)
        return Response(WorkflowStatusSerializer(status_obj).data)

    def delete(self, request, project_id, status_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only project owners and managers can configure workflow statuses."}, status=status.HTTP_403_FORBIDDEN)
        status_obj = get_object_or_404(available_statuses(project), id=status_id)
        if status_obj.key in BUILT_IN_WORKFLOW_KEYS:
            return Response({"detail": "To Do, In Progress, and Done are built-in statuses and cannot be removed."}, status=status.HTTP_400_BAD_REQUEST)
        if status_obj.project_id is None:
            status_obj = WorkflowStatus.objects.create(
                project=project,
                key=status_obj.key,
                name=status_obj.name,
                position=available_statuses(project).count(),
                is_system=False,
            )
            old_assignments = list(BoardColumnStatus.objects.filter(column__project=project, column__board__isnull=True, status__key=status_obj.key).exclude(status=status_obj))
            for assignment in old_assignments:
                BoardColumnStatus.objects.update_or_create(
                    column=assignment.column,
                    status=status_obj,
                    defaults={"position": assignment.position},
                )
                assignment.delete()
            board_assignments = list(BoardColumnStatus.objects.filter(column__project=project, column__board__isnull=False, status__key=status_obj.key).exclude(status=status_obj))
            for assignment in board_assignments:
                BoardColumnStatus.objects.update_or_create(column=assignment.column, status=status_obj, defaults={"position": assignment.position})
                assignment.delete()
        replacement_key = request.data.get("replacement_status")
        if Task.objects.filter(project=project, status=status_obj.key).exists():
            replacement = available_statuses(project).filter(key=replacement_key).exclude(id=status_obj.id).first()
            if not replacement:
                return Response({"replacement_status": "Choose a replacement status for existing tasks."}, status=status.HTTP_400_BAD_REQUEST)
            Task.objects.filter(project=project, status=status_obj.key).update(status=replacement.key)
        status_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProjectBoardColumnsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        ensure_default_columns(project)
        return Response(BoardColumnSerializer(project.board_columns.filter(board__isnull=True), many=True).data)

    def post(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can update board columns."}, status=status.HTTP_403_FORBIDDEN)
        ensure_default_columns(project)
        name = str(request.data.get("name", "")).strip()
        if not name:
            return Response({"name": "Enter a column name."}, status=status.HTTP_400_BAD_REQUEST)
        key = slugify(name).replace("-", "_")[:40]
        base_key = key or "column"
        suffix = 2
        while not key or project.board_columns.filter(board__isnull=True, key=key).exists():
            key = f"{base_key[:35]}_{suffix}"[:40]
            suffix += 1
        column = BoardColumn.objects.create(
            project=project,
            board=None,
            name=name[:80],
            key=key,
            position=int(request.data.get("position", project.board_columns.count())),
            group_name=str(request.data.get("group_name", "")).strip()[:80],
            wip_limit=request.data.get("wip_limit") or None,
        )
        status_ids = request.data.get("status_ids")
        if status_ids is not None:
            statuses = list(available_statuses(project).filter(id__in=status_ids))
            if len(statuses) != len(set(status_ids)):
                column.delete()
                return Response({"status_ids": "Choose statuses from this project workflow."}, status=status.HTTP_400_BAD_REQUEST)
            for status_obj in statuses:
                assign_status(project, status_obj, column)
        elif not request.data.get("create_empty", False):
            status_obj = WorkflowStatus.objects.create(
                project=project,
                key=unique_status_key(project, name),
                name=name[:80],
                position=available_statuses(project).count(),
                is_system=False,
            )
            assign_status(project, status_obj, column)
        return Response(BoardColumnSerializer(column).data, status=status.HTTP_201_CREATED)


class ProjectAgileBoardsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id=None, board_id=None):
        if project_id is None:
            boards = AgileBoard.objects.filter(project__in=visible_projects(request.user)).select_related("owner", "project").prefetch_related("members")
            if not request.user.is_site_admin:
                boards = boards.filter(Q(project__memberships__user=request.user, project__memberships__role__role_name__in=EDIT_PROJECT_ROLES) | Q(owner=request.user) | Q(members=request.user) | Q(sprints__tasks__assignee=request.user)).distinct()
            boards = boards.filter(is_archived=request.query_params.get("archived") == "true")
            if request.query_params.get("project_id"):
                boards = boards.filter(project_id=request.query_params["project_id"])
            return Response(AgileBoardSerializer(boards, many=True, context={"request": request}).data)
        if board_id is not None:
            project, board, error = self.get_object(request, project_id, board_id)
            if error:
                return error
            return Response(AgileBoardSerializer(board, context={"request": request}).data)
        return self.get_project_boards(request, project_id)

    def get_project_boards(self, request, project_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        boards = project.agile_boards.select_related("owner", "project").prefetch_related("members")
        if not request.user.is_site_admin and get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            boards = boards.filter(Q(owner=request.user) | Q(members=request.user) | Q(sprints__tasks__assignee=request.user)).distinct()
        boards = boards.filter(is_archived=request.query_params.get("archived") == "true")
        return Response(AgileBoardSerializer(boards, many=True, context={"request": request}).data)

    def list_accessible(self, request):
        boards = AgileBoard.objects.filter(project__in=visible_projects(request.user)).select_related("owner", "project").prefetch_related("members")
        if not request.user.is_site_admin:
            boards = boards.filter(Q(project__memberships__user=request.user, project__memberships__role__role_name__in=EDIT_PROJECT_ROLES) | Q(owner=request.user) | Q(members=request.user) | Q(sprints__tasks__assignee=request.user)).distinct()
        boards = boards.filter(is_archived=request.query_params.get("archived") == "true")
        return Response(AgileBoardSerializer(boards, many=True, context={"request": request}).data)

    def get_collection(self, request):
        return self.list_accessible(request)

    def get_object(self, request, project_id, board_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        board = get_object_or_404(project.agile_boards, id=board_id)
        if board.is_archived:
            return project, board, Response({"detail": "This board is archived."}, status=status.HTTP_404_NOT_FOUND)
        if not request.user.is_site_admin and get_role(request.user, project) not in EDIT_PROJECT_ROLES and not board.members.filter(id=request.user.id).exists() and board.owner_id != request.user.id and not board.sprints.filter(tasks__assignee=request.user).exists():
            return project, board, Response({"detail": "You do not have access to this board."}, status=status.HTTP_404_NOT_FOUND)
        return project, board, None

    def patch(self, request, project_id=None, board_id=None):
        if project_id is None and board_id is not None:
            board = get_object_or_404(AgileBoard.objects.filter(project__in=visible_projects(request.user)), id=board_id)
            project_id = board.project_id
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        board = get_object_or_404(project.agile_boards, id=board_id)
        if not request.user.is_site_admin and board.owner_id != request.user.id and get_role(request.user, project) not in EDIT_PROJECT_ROLES and not request.user.has_perm("tasks.create_agileboard"):
            return Response({"detail": "Only the board owner or a project administrator can edit this board."}, status=status.HTTP_403_FORBIDDEN)
        if request.data.get("is_archived") is True:
            if board.sprints.filter(is_active=True, is_closed=False).exists():
                return Response({"detail": "An active sprint board cannot be archived."}, status=status.HTTP_400_BAD_REQUEST)
            board.is_archived = True
            board.save(update_fields=["is_archived", "updated_at"])
            return Response(AgileBoardSerializer(board, context={"request": request}).data)
        serializer = AgileBoardSerializer(board, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        member_ids = serializer.validated_data.pop("members", None)
        if member_ids is not None:
            project_members = set(project.memberships.filter(Q(removal_date__isnull=True) | Q(removal_date__gt=timezone.localdate())).values_list("user_id", flat=True))
            if not {member.id for member in member_ids}.issubset(project_members):
                return Response({"member_ids": "Board members must be active members of the project."}, status=status.HTTP_400_BAD_REQUEST)
        board = serializer.save()
        if member_ids is not None:
            board.members.set(member_ids)
        return Response(AgileBoardSerializer(board, context={"request": request}).data)

    def post(self, request, project_id=None):
        project_id = project_id or request.data.get("project_id")
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if not request.user.is_site_admin and get_role(request.user, project) not in EDIT_PROJECT_ROLES and not request.user.has_perm("tasks.create_agileboard"):
            return Response({"detail": "BOARD_CREATE permission is required to create boards."}, status=status.HTTP_403_FORBIDDEN)
        serializer = AgileBoardSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        member_ids = [member.id for member in serializer.validated_data.pop("members", [])]
        project_members = set(project.memberships.filter(Q(removal_date__isnull=True) | Q(removal_date__gt=timezone.localdate())).values_list("user_id", flat=True))
        if not set(member_ids).issubset(project_members):
            return Response({"member_ids": "Board members must be active members of the project."}, status=status.HTTP_400_BAD_REQUEST)
        board = serializer.save(project=project, owner=request.user)
        board.members.set(set(member_ids) | {request.user.id})
        return Response(AgileBoardSerializer(board, context={"request": request}).data, status=status.HTTP_201_CREATED)


class AgileBoardColumnsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_board(self, request, project_id, board_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        board = get_object_or_404(project.agile_boards, id=board_id, is_archived=False)
        if not request.user.is_site_admin and board.owner_id != request.user.id and get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return board, Response({"detail": "Only the board owner or a project administrator can configure its columns."}, status=status.HTTP_403_FORBIDDEN)
        return board, None

    def get(self, request, project_id, board_id):
        board, error = self.get_board(request, project_id, board_id)
        if error:
            return error
        ensure_board_columns(board)
        return Response(BoardColumnSerializer(board.columns.all(), many=True).data)

    def put(self, request, project_id, board_id):
        return BoardWorkflowView().get(request, project_id, board_id)

    def post(self, request, project_id, board_id):
        board, error = self.get_board(request, project_id, board_id)
        if error:
            return error
        ensure_board_columns(board)
        name = str(request.data.get("name", "")).strip()[:80]
        if not name:
            return Response({"name": "Enter a column name."}, status=status.HTTP_400_BAD_REQUEST)
        base = slugify(name).replace("-", "_")[:32] or "column"
        key, suffix = base, 2
        while board.columns.filter(key=key).exists():
            key, suffix = f"{base[:35]}_{suffix}"[:40], suffix + 1
        column = BoardColumn.objects.create(project=board.project, board=board, name=name, key=key,
            position=int(request.data.get("position", board.columns.count())), group_name="Board", wip_limit=request.data.get("wip_limit") or None)
        status_ids = request.data.get("status_ids", [])
        if not isinstance(status_ids, list):
            column.delete()
            return Response({"status_ids": "Choose a list of workflow statuses."}, status=status.HTTP_400_BAD_REQUEST)
        statuses = list(available_statuses(board.project).filter(id__in=status_ids))
        if len(statuses) != len(set(status_ids)):
            column.delete()
            return Response({"status_ids": "Choose statuses from this project workflow."}, status=status.HTTP_400_BAD_REQUEST)
        for status_obj in statuses:
            BoardColumnStatus.objects.create(column=column, status=status_obj, position=column.status_assignments.count())
        return Response(BoardColumnSerializer(column).data, status=status.HTTP_201_CREATED)


class AgileBoardColumnDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, project_id, board_id, column_id):
        view = AgileBoardColumnsView()
        board, error = view.get_board(request, project_id, board_id)
        if error:
            return error
        ensure_board_columns(board)
        column = get_object_or_404(board.columns, id=column_id)
        data = request.data.copy()
        status_ids = data.pop("status_ids", None)
        serializer = BoardColumnSerializer(column, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        statuses = None
        if status_ids is not None:
            if not isinstance(status_ids, list):
                return Response({"status_ids": "Choose a list of workflow statuses."}, status=status.HTTP_400_BAD_REQUEST)
            statuses = list(available_statuses(board.project).filter(id__in=status_ids))
            if len(statuses) != len(set(status_ids)):
                return Response({"status_ids": "Choose statuses from this project workflow."}, status=status.HTTP_400_BAD_REQUEST)
        column = serializer.save()
        if statuses is not None:
            BoardColumnStatus.objects.filter(column__board=board, status_id__in=[item.id for item in statuses]).exclude(column=column).delete()
            column.status_assignments.all().delete()
            for position, status_obj in enumerate(statuses):
                BoardColumnStatus.objects.create(column=column, status=status_obj, position=position)
        return Response(BoardColumnSerializer(column).data)

    def delete(self, request, project_id, board_id, column_id):
        view = AgileBoardColumnsView()
        board, error = view.get_board(request, project_id, board_id)
        if error:
            return error
        ensure_board_columns(board)
        column = get_object_or_404(board.columns, id=column_id)
        destination_key = request.query_params.get("move_to") or request.data.get("move_to")
        replacement = board.columns.exclude(id=column.id).filter(status_assignments__status__key=destination_key).first() if destination_key else None
        if column.status_assignments.exists() and not replacement:
            return Response({"move_to": "Choose an existing board column to receive this column's statuses."}, status=status.HTTP_400_BAD_REQUEST)
        if replacement:
            existing = set(replacement.status_assignments.values_list("status_id", flat=True))
            for assignment in column.status_assignments.all():
                if assignment.status_id not in existing:
                    BoardColumnStatus.objects.create(column=replacement, status_id=assignment.status_id, position=replacement.status_assignments.count())
        column.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ProjectBoardColumnDetailView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def patch(self, request, project_id, column_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can update board columns."}, status=status.HTTP_403_FORBIDDEN)
        column = get_object_or_404(BoardColumn, project=project, board__isnull=True, id=column_id)
        data = request.data.copy()
        status_ids = data.pop("status_ids", None)
        serializer = BoardColumnSerializer(column, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        statuses_by_id = None
        if status_ids is not None:
            if not isinstance(status_ids, list):
                return Response({"status_ids": "Choose a list of workflow statuses."}, status=status.HTTP_400_BAD_REQUEST)
            statuses = list(available_statuses(project).filter(id__in=status_ids))
            statuses_by_id = {workflow_status.id: workflow_status for workflow_status in statuses}
            if len(statuses_by_id) != len(set(status_ids)):
                return Response({"status_ids": "Choose statuses from this project workflow."}, status=status.HTTP_400_BAD_REQUEST)
        column = serializer.save()
        if statuses_by_id is not None:
            column.status_assignments.exclude(status_id__in=status_ids).delete()
            for position, status_id in enumerate(status_ids):
                status_obj = statuses_by_id[status_id]
                BoardColumnStatus.objects.filter(column__project=project, column__board__isnull=True, status=status_obj).exclude(column=column).delete()
                BoardColumnStatus.objects.update_or_create(
                    column=column,
                    status=status_obj,
                    defaults={"position": position},
                )
        return Response(BoardColumnSerializer(column).data)

    def delete(self, request, project_id, column_id):
        project = get_object_or_404(visible_projects(request.user), id=project_id)
        if get_role(request.user, project) not in EDIT_PROJECT_ROLES:
            return Response({"detail": "Only owners and managers can update board columns."}, status=status.HTTP_403_FORBIDDEN)
        column = get_object_or_404(BoardColumn, project=project, board__isnull=True, id=column_id)
        if column.status_assignments.exists():
            return Response({"detail": "Move the statuses to another project workflow column before deleting this column."}, status=status.HTTP_400_BAD_REQUEST)
        column.delete()
        for position, remaining in enumerate(project.board_columns.order_by("position", "id")):
            if remaining.position != position:
                BoardColumn.objects.filter(id=remaining.id).update(position=position)
        return Response(status=status.HTTP_204_NO_CONTENT)

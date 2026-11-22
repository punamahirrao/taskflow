from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from projects.access import visible_projects, get_role, WRITE_TASK_ROLES
from projects.models import ProjectWorkflowGraph
from projects.workflow_graph import default_graph, validate_graph
from tasks.models import AgileBoard, BoardColumn, BoardColumnStatus, Task, WorkflowStatus
from tasks.services.workflows import ensure_default_columns


def persist_story_stages(project, graph):
    ensure_default_columns(project)
    node_keys = {node["key"] for node in graph["nodes"]}
    existing_custom = WorkflowStatus.objects.filter(project=project)
    removed = existing_custom.exclude(key__in=node_keys)
    for status in removed:
        if Task.objects.filter(project=project, status=status.key).exists():
            raise ValidationError({"nodes": f"Move work out of {status.name} before removing that stage."})
        matching_columns = list(BoardColumn.objects.filter(project=project, key=status.key))
        status.delete()
        for column in matching_columns:
            if not column.status_assignments.exists():
                column.delete()

    for position, node in enumerate(graph["nodes"]):
        key = node["key"]
        status = WorkflowStatus.objects.filter(project=project, key=key).first()
        if status is None:
            status = WorkflowStatus.objects.filter(project__isnull=True, key=key, is_system=True).first()
        if status is None:
            status = WorkflowStatus.objects.create(project=project, key=key, name=node["label"], position=position)
        elif status.project_id is None and status.name != node["label"]:
            raise ValidationError({"nodes": f"The shared {status.name} stage cannot be renamed for one project."})
        elif status.project_id == project.id and status.name != node["label"]:
            status.name = node["label"]
            status.save(update_fields=["name"])
            BoardColumn.objects.filter(project=project, key=key).update(name=node["label"])
        columns = [
            BoardColumn.objects.get_or_create(project=project, board=None, key=key, defaults={"name": node["label"], "position": position, "group_name": "Active work"})[0],
            *[BoardColumn.objects.get_or_create(project=project, board=board, key=key, defaults={"name": node["label"], "position": position, "group_name": "Active work"})[0] for board in AgileBoard.objects.filter(project=project)],
        ]
        for column in columns:
            BoardColumnStatus.objects.get_or_create(column=column, status=status, defaults={"position": column.status_assignments.count()})


class ProjectWorkflowView(APIView):
    permission_classes = [IsAuthenticated]

    def project(self, request, project_id):
        return get_object_or_404(visible_projects(request.user), pk=project_id)

    def get(self, request, project_id, kind):
        if kind not in ("story", "release"):
            return Response({"detail": "Unknown workflow type."}, status=404)
        project = self.project(request, project_id)
        saved = ProjectWorkflowGraph.objects.filter(project=project, kind=kind).first()
        graph = saved.graph if saved else default_graph(project, kind)
        if kind == "story":
            project_keys = set(WorkflowStatus.objects.filter(project=project).values_list("key", flat=True))
            graph = {**graph, "nodes": [{**node, "editable": node["key"] in project_keys} for node in graph["nodes"]]}
        return Response({**graph, "kind": kind,
                         "enabled": saved.enabled if saved else False,
                         "configured": saved is not None,
                         "revision": saved.revision if saved else 0,
                         "can_manage": get_role(request.user, project) in WRITE_TASK_ROLES and get_role(request.user, project) in ("owner", "admin")})

    @transaction.atomic
    def put(self, request, project_id, kind):
        if kind not in ("story", "release"):
            return Response({"detail": "Unknown workflow type."}, status=404)
        project = self.project(request, project_id)
        from projects.models import Project
        Project.objects.select_for_update().get(pk=project.pk)
        role = get_role(request.user, project)
        if role not in ("owner", "admin"):
            return Response({"detail": "Only project owners and admins can configure workflows."}, status=403)
        payload = request.data
        if not isinstance(payload.get("enabled"), bool) or not isinstance(payload.get("revision"), int):
            return Response({"detail": "Workflow enabled state and revision are required."}, status=400)
        graph = {key: payload.get(key) for key in ("nodes", "edges", "start_key", "end_key")}
        validate_graph(graph, kind)
        current = ProjectWorkflowGraph.objects.select_for_update().filter(project=project, kind=kind).first()
        revision = current.revision if current else 0
        if payload["revision"] != revision:
            return Response({"detail": "This workflow changed elsewhere. Reload it before saving."}, status=409)
        if kind == "story":
            persist_story_stages(project, graph)
        saved, _ = ProjectWorkflowGraph.objects.update_or_create(
            project=project, kind=kind,
            defaults={"graph": graph, "enabled": payload["enabled"], "revision": revision + 1, "updated_by": request.user},
        )
        return Response({**saved.graph, "kind": kind, "enabled": saved.enabled, "configured": True,
                         "revision": saved.revision, "can_manage": True})

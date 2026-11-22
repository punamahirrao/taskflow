from collections import defaultdict, deque
import re

from rest_framework.exceptions import ValidationError

from projects.models import ProjectWorkflowGraph
from tasks.models import WorkflowStatus


def default_graph(project, kind):
    if kind == "release":
        names = [("planned", "Planned"), ("in_progress", "In progress"), ("changes_requested", "Changes requested"), ("ready", "Ready"), ("done", "Done")]
        edges = [("planned", "in_progress"), ("in_progress", "changes_requested"), ("changes_requested", "in_progress"), ("in_progress", "ready"), ("ready", "done")]
    else:
        statuses = list(WorkflowStatus.objects.filter(columns__project=project).distinct().order_by("position", "key"))
        if not statuses:
            from tasks.services.workflows import ensure_default_columns
            ensure_default_columns(project)
            statuses = list(WorkflowStatus.objects.filter(columns__project=project).distinct().order_by("position", "key"))
        names = [(item.key, item.name) for item in statuses]
        keys = [key for key, _ in names]
        edges = [(left, right) for left, right in zip(keys, keys[1:])]
        if "backlog" in keys and "in_progress" in keys:
            edges.append(("backlog", "in_progress"))
        if "in_progress" in keys and "todo" in keys:
            edges.append(("in_progress", "todo"))
    nodes = [{"key": key, "label": label, "x": 70 + (index % 4) * 290, "y": 70 + (index // 4) * 170} for index, (key, label) in enumerate(names)]
    return {"nodes": nodes, "edges": [{"source": a, "target": b} for a, b in edges], "start_key": names[0][0] if names else "", "end_key": names[-1][0] if names else ""}


def validate_graph(graph, kind):
    nodes, edges = graph.get("nodes"), graph.get("edges")
    if not isinstance(nodes, list) or not 2 <= len(nodes) <= 50 or not isinstance(edges, list) or len(edges) > 200:
        raise ValidationError({"graph": "Add between 2 and 50 workflow stages and no more than 200 transitions."})
    keys = set()
    for node in nodes:
        key = node.get("key") if isinstance(node, dict) else None
        if not isinstance(key, str) or not re.fullmatch(r"[a-z0-9_]{1,40}", key) or key in keys or not isinstance(node.get("label"), str) or not node["label"].strip() or len(node["label"]) > 80:
            raise ValidationError({"nodes": "Each stage needs a unique key and a name of 1–80 characters."})
        if any(not isinstance(node.get(axis), (int, float)) or abs(node[axis]) > 3000 for axis in ("x", "y")):
            raise ValidationError({"nodes": "Stage positions must be within the workflow canvas."})
        keys.add(key)
    start, end = graph.get("start_key"), graph.get("end_key")
    if start not in keys or end not in keys or start == end:
        raise ValidationError({"graph": "Choose different start and finish stages."})
    pairs, adjacency = set(), defaultdict(list)
    for edge in edges:
        source, target = edge.get("source"), edge.get("target")
        pair = (source, target)
        if source not in keys or target not in keys or source == target or pair in pairs:
            raise ValidationError({"edges": "Transitions must connect different stages and cannot be duplicated."})
        pairs.add(pair)
        adjacency[source].append(target)
    reached, queue = {start}, deque([start])
    while queue:
        for target in adjacency[queue.popleft()]:
            if target not in reached:
                reached.add(target)
                queue.append(target)
    if end not in reached:
        raise ValidationError({"edges": "The finish stage must be reachable from the start stage."})
    if kind == "release":
        required_nodes = {"planned", "in_progress", "changes_requested", "ready", "done"}
        required_edges = {("planned", "in_progress"), ("in_progress", "ready"), ("ready", "done")}
        rework_edges = {("in_progress", "changes_requested"), ("changes_requested", "in_progress")}
        if (start, end) != ("planned", "done") or keys != required_nodes:
            raise ValidationError({"graph": "Release workflows use the Planned, In progress, Changes requested, Ready and Done stages."})
        if not required_edges.issubset(pairs) or bool(pairs & rework_edges) and not rework_edges.issubset(pairs) or pairs - required_edges - rework_edges:
            raise ValidationError({"edges": "Release transitions must preserve start, approval completion and finish; the rework loop is optional."})


def enforce_transition(project, kind, old, new):
    if old == new:
        return
    saved = ProjectWorkflowGraph.objects.filter(project=project, kind=kind, enabled=True).first()
    if not saved:
        return
    allowed = any(item["source"] == old and item["target"] == new for item in saved.graph.get("edges", []))
    if not allowed:
        raise ValidationError({"status": f"The {old.replace('_', ' ')} to {new.replace('_', ' ')} transition is not allowed by this workflow."})

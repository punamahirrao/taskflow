from projects.tests.base import RolesBase
from projects.models import PlanningItem, ProjectWorkflowGraph, ReleaseApproval
from tasks.models import BoardColumn, Task, WorkflowStatus


class ProjectWorkflowGraphTests(RolesBase):
    def endpoint(self, kind="story"):
        return f"/projects/{self.project.id}/workflows/{kind}/"

    def test_view_permissions_revision_and_transition_enforcement(self):
        response = self.as_user(self.owner).get(self.endpoint())
        self.assertEqual(response.status_code, 200)
        graph = response.data
        self.assertFalse(graph["configured"])
        self.assertTrue(graph["can_manage"])
        self.assertGreaterEqual(len(graph["nodes"]), 2)

        self.as_user(self.member)
        self.assertFalse(self.client.get(self.endpoint()).data["can_manage"])
        self.assertEqual(self.client.put(self.endpoint(), graph, format="json").status_code, 403)

        self.as_user(self.owner)
        graph["edges"] = [{"source": "backlog", "target": "done"}]
        graph["start_key"] = "backlog"
        graph["nodes"].append({"key": "security_review", "label": "Security review", "x": 900, "y": 250})
        graph["nodes"][-1]["label"] = "Security sign-off"
        graph["edges"].append({"source": "done", "target": "security_review"})
        graph["end_key"] = "security_review"
        graph["enabled"] = True
        saved = self.client.put(self.endpoint(), graph, format="json")
        self.assertEqual(saved.status_code, 200, saved.data)
        self.assertEqual(WorkflowStatus.objects.get(project=self.project, key="security_review").name, "Security sign-off")
        self.assertTrue(BoardColumn.objects.filter(project=self.project, key="security_review").exists())
        task = Task.objects.create(project=self.project, title="Transition check")
        self.assertEqual(
            self.client.patch(f"/tasks/{task.id}/", {"status": "todo"}, format="json").status_code,
            400,
        )
        self.assertEqual(
            self.client.patch(f"/tasks/{task.id}/", {"status": "done"}, format="json").status_code,
            200,
        )
        self.assertEqual(
            self.client.patch(f"/tasks/{task.id}/", {"status": "security_review"}, format="json").status_code,
            200,
        )
        graph["revision"] = 1
        graph["nodes"] = [node for node in graph["nodes"] if node["key"] != "security_review"]
        graph["edges"] = [{"source": "backlog", "target": "done"}]
        graph["end_key"] = "done"
        self.assertEqual(self.client.put(self.endpoint(), graph, format="json").status_code, 400)
        self.assertEqual(ProjectWorkflowGraph.objects.get(project=self.project).revision, 1)

        graph["revision"] = 0
        self.assertEqual(self.client.put(self.endpoint(), graph, format="json").status_code, 409)

    def test_rejects_disconnected_finish_and_hides_other_projects(self):
        self.as_user(self.owner)
        graph = self.client.get(self.endpoint("release")).data
        graph["edges"] = [
            edge for edge in graph["edges"]
            if not (edge["source"] == "in_progress" and edge["target"] == "ready")
        ]
        response = self.client.put(self.endpoint("release"), graph, format="json")
        self.assertEqual(response.status_code, 400)
        self.assertIn("edges", response.data)
        self.assertEqual(self.client.get(f"/projects/{self.other.id}/workflows/story/").status_code, 404)

    def test_release_approval_state_change_obeys_configured_graph(self):
        self.as_user(self.owner)
        self.owner.active_organization.owner = self.owner
        self.owner.active_organization.save(update_fields=["owner"])
        release = PlanningItem.objects.create(organization=self.owner.active_organization, kind="release", name="Launch")
        step = ReleaseApproval.objects.create(release=release, position=0, name="Owner approval", approver=self.owner)
        release.tasks.add(self.owner_task)
        graph = self.client.get(self.endpoint("release")).data
        graph["enabled"] = True
        graph["edges"] = [edge for edge in graph["edges"] if not (edge["source"] == "in_progress" and edge["target"] == "changes_requested") and not (edge["source"] == "changes_requested" and edge["target"] == "in_progress")]
        self.assertEqual(self.client.put(self.endpoint("release"), graph, format="json").status_code, 200)
        endpoint = f"/projects/releases/{release.id}/actions/"
        self.assertEqual(self.client.post(endpoint, {"action": "start"}, format="json").status_code, 200)
        rejected = self.client.post(endpoint, {"action": "request_changes", "step_id": step.id, "note": "Revisit scope"}, format="json")
        self.assertEqual(rejected.status_code, 400)
        step.refresh_from_db()
        self.assertEqual(step.status, ReleaseApproval.Status.PENDING)

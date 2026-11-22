from django.test import override_settings
from rest_framework.test import APITestCase

from accounts.models import Organization, User
from projects.models import PlanningItem


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class ReleaseFlowTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(email="release-owner@example.test")
        self.reviewer = User.objects.create_user(email="release-reviewer@example.test")
        self.outsider = User.objects.create_user(email="release-outsider@example.test")
        self.org = Organization.objects.create(name="Taskflow", owner=self.owner)
        self.org.members.add(self.owner, self.reviewer)
        self.other = Organization.objects.create(name="Other", owner=self.outsider)
        self.other.members.add(self.outsider)
        for user, org in (
            (self.owner, self.org),
            (self.reviewer, self.org),
            (self.outsider, self.other),
        ):
            user.active_organization = org
            user.save(update_fields=["active_organization"])
        self.goal = PlanningItem.objects.create(
            organization=self.org, kind="goal", name="Launch readiness"
        )
        self.client.force_authenticate(self.owner)

    def create_release(self):
        response = self.client.post(
            "/projects/releases/",
            {
                "name": "Version 2.0",
                "goal_ids": [self.goal.id],
                "steps": [
                    {"name": "Quality review", "approver_id": self.reviewer.id},
                    {"name": "Launch sign-off", "approver_id": self.owner.id},
                ],
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201, response.data)
        return response.data

    def test_ordered_approvals_rework_and_goal_backlinks(self):
        release = self.create_release()
        first, second = [step["id"] for step in release["steps"]]
        endpoint = f"/projects/releases/{release['id']}/actions/"

        def act(action, **fields):
            return self.client.post(
                endpoint, {"action": action, **fields}, format="json"
            )

        self.assertEqual(release["state"], "planned")
        self.assertEqual(
            self.client.get("/projects/planning/?kind=goal").data["items"][0][
                "related_releases"
            ][0]["id"],
            release["id"],
        )
        self.assertEqual(act("finish").status_code, 400)
        self.assertEqual(act("start").data["active_step_id"], first)
        self.assertEqual(act("approve", step_id=second).status_code, 400)
        self.assertEqual(act("approve", step_id=first).status_code, 403)
        self.assertEqual(
            self.client.patch(
                f"/projects/planning/{release['id']}/",
                {"status": "done"},
                format="json",
            ).status_code,
            400,
        )
        self.client.force_authenticate(self.reviewer)
        item = self.client.get("/projects/releases/?mine=true").data["items"][0]
        self.assertTrue(item["steps"][0]["can_decide"])
        self.assertEqual(act("request_changes", step_id=first).status_code, 400)
        self.assertEqual(
            act("request_changes", step_id=first, note="Verify onboarding").data[
                "state"
            ],
            "changes_requested",
        )
        self.assertEqual(act("resume", step_id=first).status_code, 403)
        self.client.force_authenticate(self.owner)
        self.assertEqual(act("resume", step_id=first).data["state"], "in_progress")
        self.client.force_authenticate(self.reviewer)
        self.assertEqual(act("approve", step_id=first).data["active_step_id"], second)
        self.client.force_authenticate(self.owner)
        self.assertEqual(act("approve", step_id=second).data["state"], "ready")
        self.assertEqual(act("finish").data["state"], "done")

    def test_rejects_external_goals_approvers_and_actions(self):
        external = PlanningItem.objects.create(
            organization=self.other, kind="goal", name="Other company's goal"
        )
        for payload in (
            {"goal_ids": [external.id]},
            {"steps": [{"name": "Unauthorized", "approver_id": self.outsider.id}]},
        ):
            response = self.client.post(
                "/projects/releases/",
                {"name": "Invalid release", **payload},
                format="json",
            )
            self.assertEqual(response.status_code, 400, response.data)
        release = self.create_release()
        self.client.force_authenticate(self.outsider)
        self.assertEqual(self.client.get("/projects/releases/").data["items"], [])
        self.assertEqual(
            self.client.post(
                f"/projects/releases/{release['id']}/actions/",
                {"action": "approve", "step_id": release["steps"][0]["id"]},
                format="json",
            ).status_code,
            404,
        )

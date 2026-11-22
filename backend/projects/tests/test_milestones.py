from django.test import override_settings
from rest_framework.test import APITestCase

from accounts.models import Organization, User
from projects.models import PlanningItem, Project, ProjectMembership, ProjectRole
from tasks.models import Task


@override_settings(PASSWORD_HASHERS=["django.contrib.auth.hashers.MD5PasswordHasher"])
class MilestoneCreationTests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(email="milestone-owner@example.test")
        self.member = User.objects.create_user(email="milestone-member@example.test")
        self.outsider = User.objects.create_user(email="milestone-outsider@example.test")
        self.org = Organization.objects.create(name="Delivery", owner=self.owner)
        self.other = Organization.objects.create(name="Other", owner=self.outsider)
        self.org.members.add(self.owner, self.member)
        self.other.members.add(self.outsider)
        for user, org in ((self.owner, self.org), (self.member, self.org), (self.outsider, self.other)):
            user.active_organization = org
            user.save(update_fields=["active_organization"])
        self.project = Project.objects.create(name="Launch", organization=self.org)
        ProjectMembership.objects.create(
            project=self.project, user=self.owner,
            role=ProjectRole.objects.get(role_name="owner"),
        )
        self.task = Task.objects.create(project=self.project, title="Acceptance checks")
        private = Project.objects.create(name="Private", organization=self.other)
        self.private_task = Task.objects.create(project=private, title="Private work")
        self.client.force_authenticate(self.owner)

    def test_milestone_is_created_linked_and_updated(self):
        response = self.client.post("/projects/planning/", {
            "kind": "milestone", "name": "Beta launch", "description": "Acceptance complete",
            "target_date": "2026-12-18", "tasks": [self.task.id],
        }, format="json")
        self.assertEqual(response.status_code, 201, response.data)
        milestone = PlanningItem.objects.get(pk=response.data["id"])
        self.assertEqual(milestone.organization_id, self.org.id)
        self.assertEqual(milestone.created_by_id, self.owner.id)
        self.assertEqual(list(milestone.tasks.values_list("id", flat=True)), [self.task.id])
        listed = self.client.get("/projects/planning/?kind=milestone").data
        self.assertTrue(listed["can_manage"])
        self.assertEqual(listed["items"][0]["target_date"], "2026-12-18")
        updated = self.client.patch(f"/projects/planning/{milestone.id}/", {"status": "done"}, format="json")
        self.assertEqual(updated.status_code, 200, updated.data)
        milestone.refresh_from_db()
        self.assertEqual(milestone.status, "done")

    def test_rejects_restricted_task_links_and_empty_names(self):
        for values in ({"tasks": [self.private_task.id]}, {"name": "   "}):
            response = self.client.post("/projects/planning/", {"kind": "milestone", "name": "Beta", **values}, format="json")
            self.assertEqual(response.status_code, 400, response.data)
        self.assertFalse(PlanningItem.objects.filter(organization=self.org).exists())

    def test_permissions_and_organization_isolation(self):
        milestone = PlanningItem.objects.create(organization=self.org, kind="milestone", name="Beta")
        self.client.force_authenticate(self.member)
        self.assertFalse(self.client.get("/projects/planning/?kind=milestone").data["can_manage"])
        self.assertEqual(self.client.post("/projects/planning/", {"kind": "milestone", "name": "Other"}, format="json").status_code, 403)
        self.client.force_authenticate(self.outsider)
        self.assertEqual(self.client.get("/projects/planning/?kind=milestone").data["items"], [])
        self.assertEqual(self.client.patch(f"/projects/planning/{milestone.id}/", {"name": "Changed"}, format="json").status_code, 404)

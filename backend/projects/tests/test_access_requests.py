from datetime import timedelta
from django.utils import timezone

from accounts.models import Organization
from projects.models import Project, ProjectAccessRequest, ProjectMembership
from . import base


class ProjectAccessRequestTests(base.RolesBase):
    def setUp(self):
        super().setUp()
        self.request_url = f"/projects/{self.project.pk}/access-requests/"
        self.payload = {"requested_role": "viewer", "reason": "Review the delivery plan."}

    def submit(self):
        return self.as_user(self.stranger).post(self.request_url, self.payload, format="json")

    def test_requires_authentication(self):
        self.client.force_authenticate(user=None)
        self.assertEqual(self.client.post(self.request_url, self.payload).status_code, 401)
        self.assertEqual(self.client.get("/projects/access-requests/").status_code, 401)

    def test_request_is_saved_without_granting_access_and_duplicates_are_idempotent(self):
        response = self.submit()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["status"], "pending")
        self.assertEqual(self.client.get(self.url).status_code, 404)
        self.assertEqual(self.submit().status_code, 200)
        self.assertEqual(ProjectAccessRequest.objects.count(), 1)
        rows = self.client.get("/projects/directory/").json()
        self.assertEqual(next(row for row in rows if row["id"] == self.project.pk)["access_request_status"], "pending")

    def test_members_cannot_request_access_or_escalate_roles(self):
        self.assertEqual(self.as_user(self.member).post(self.request_url, self.payload).status_code, 400)
        for role in ("owner", "admin", "siteadmin"):
            self.assertEqual(self.as_user(self.stranger).post(self.request_url, {**self.payload, "requested_role": role}).status_code, 400)
        self.assertEqual(self.as_user(self.stranger).post(self.request_url, {**self.payload, "reason": " "}).status_code, 400)
        self.assertEqual(self.as_user(self.stranger).post(self.request_url, {**self.payload, "reason": "a" * 1001}).status_code, 400)

    def test_inbox_only_shows_requests_for_projects_actor_manages(self):
        self.submit()
        for actor in (self.owner, self.padmin, self.site_admin):
            rows = self.as_user(actor).get("/projects/access-requests/").json()
            self.assertEqual(len(rows), 1)
            self.assertEqual(rows[0]["requester"]["id"], self.stranger.pk)
        for actor in (self.member, self.viewer, self.stranger):
            self.assertEqual(self.as_user(actor).get("/projects/access-requests/").json(), [])

    def test_owner_approval_grants_only_the_requested_role(self):
        item_id = self.submit().json()["id"]
        response = self.as_user(self.owner).patch(f"/projects/access-requests/{item_id}/", {"status": "approved", "requested_role": "owner"}, format="json")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.as_user(self.stranger).get(self.url).json()["my_role"], "viewer")
        self.assertEqual(self.as_user(self.owner).get("/projects/access-requests/").json(), [])

    def test_regular_member_cannot_approve(self):
        item_id = self.submit().json()["id"]
        self.assertEqual(self.as_user(self.member).patch(f"/projects/access-requests/{item_id}/", {"status": "approved"}).status_code, 403)
        self.assertFalse(ProjectMembership.objects.filter(project=self.project, user=self.stranger).exists())

    def test_decline_does_not_grant_access_and_request_can_be_resubmitted(self):
        item_id = self.submit().json()["id"]
        self.assertEqual(self.as_user(self.padmin).patch(f"/projects/access-requests/{item_id}/", {"status": "declined"}).status_code, 200)
        self.assertEqual(self.as_user(self.stranger).get(self.url).status_code, 404)
        self.assertEqual(self.submit().json()["status"], "pending")
        self.assertEqual(ProjectAccessRequest.objects.count(), 1)

    def test_cross_organization_projects_are_not_discoverable_or_requestable(self):
        other_org = Organization.objects.create(name="Separate organization")
        project = Project.objects.create(name="Private project", organization=other_org)
        self.assertEqual(self.as_user(self.stranger).post(f"/projects/{project.pk}/access-requests/", self.payload).status_code, 404)
        self.assertNotIn(project.pk, [row["id"] for row in self.client.get("/projects/directory/").json()])

    def test_removed_org_member_cannot_be_approved(self):
        item_id = self.submit().json()["id"]
        self.stranger.organizations.remove(self.project.organization)
        self.assertEqual(self.as_user(self.owner).patch(f"/projects/access-requests/{item_id}/", {"status": "approved"}).status_code, 400)

    def test_expired_project_membership_can_request_and_be_reactivated(self):
        membership = ProjectMembership.objects.get(project=self.project, user=self.member)
        membership.removal_date = timezone.localdate() - timedelta(days=1)
        membership.save()
        item_id = self.as_user(self.member).post(self.request_url, self.payload).json()["id"]
        self.assertEqual(self.as_user(self.owner).patch(f"/projects/access-requests/{item_id}/", {"status": "approved"}).status_code, 200)
        membership.refresh_from_db()
        self.assertIsNone(membership.removal_date)
        self.assertEqual(membership.role.role_name, "viewer")
